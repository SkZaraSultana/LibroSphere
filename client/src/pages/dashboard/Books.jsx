import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiSearch, FiTrash2, FiEdit2, FiBookOpen, FiPackage, FiClock, FiPlus, FiImage, FiChevronLeft, FiChevronRight, FiAlertCircle, FiCamera } from 'react-icons/fi'
import PrimaryButton from '../../components/auth/PrimaryButton'
import TextInput from '../../components/form/TextInput'
import SelectInput from '../../components/form/SelectInput'
import TextArea from '../../components/form/TextArea'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge'
import { fetchBooks, createBook, updateBook, deleteBook } from '../../services/bookService'
import { CATEGORY_CHANGED_EVENT, fetchCategories } from '../../services/categoryService'

const initialFormState = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  language: '',
  publishedYear: '',
  edition: '',
  shelfLocation: '',
  copies: 1,
  coverImage: '',
  description: '',
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title-asc', label: 'A-Z' },
  { value: 'title-desc', label: 'Z-A' },
]

function AnimatedStatCard({ icon, title, value, description }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = null
    const duration = 800
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step)
    return () => setCount(value)
  }, [value])

  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)]/90 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {icon}
        </div>
      </div>
      <p className="mt-5 text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">{count.toLocaleString()}</p>
      <p className="mt-2 text-sm text-[var(--color-text-2)]">{description}</p>
    </div>
  )
}

export default function Books() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const normalizedCategories = Array.isArray(categories) ? categories : []
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [selectedBook, setSelectedBook] = useState(null)
  const [viewBook, setViewBook] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerLoading, setScannerLoading] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const [isScannerReady, setIsScannerReady] = useState(false)
  const [manualISBN, setManualISBN] = useState('')
  const scannerVideoRef = useRef(null)
  const scannerInstanceRef = useRef(null)
  const scannerControlsRef = useRef(null)
  const scanInFlightRef = useRef(false)
  const [summary, setSummary] = useState({ totalBooks: 0, availableBooks: 0, issuedBooks: 0, unavailableBooks: 0 })

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 320)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, categoryFilter, availabilityFilter, sortBy])

  useEffect(() => {
    loadBooks()
  }, [page, debouncedSearch, categoryFilter, availabilityFilter, sortBy])

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const handleCategoriesChanged = () => {
      loadCategories()
    }

    window.addEventListener(CATEGORY_CHANGED_EVENT, handleCategoriesChanged)
    return () => {
      window.removeEventListener(CATEGORY_CHANGED_EVENT, handleCategoriesChanged)
    }
  }, [])

  useEffect(() => {
    const shouldLockScroll = isModalOpen || Boolean(deleteTarget) || Boolean(viewBook) || scannerOpen
    document.body.style.overflow = shouldLockScroll ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen, deleteTarget, viewBook, scannerOpen])

  useEffect(() => {
    let active = true
    if (!scannerOpen) return undefined

    const startScanner = async () => {
      setScannerError('')
      setScannerLoading(true)

      if (!navigator.mediaDevices) {
        console.log('MediaDevices API unavailable')
        setScannerError('MediaDevices API unavailable')
        setScannerLoading(false)
        return
      }

      console.log('Opening camera...')

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
        })

        console.log('Camera stream acquired')

        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        if (scannerVideoRef.current) {
          scannerVideoRef.current.srcObject = stream

          await new Promise((resolve, reject) => {
            const video = scannerVideoRef.current
            if (!video) {
              reject(new Error('Video element missing'))
              return
            }
            video.onloadedmetadata = () => {
              resolve()
            }
            video.onerror = () => reject(new Error('Video element error'))
          })

          await scannerVideoRef.current.play()
          console.log('Video playing')
          console.log('videoWidth', scannerVideoRef.current.videoWidth)
          console.log('videoHeight', scannerVideoRef.current.videoHeight)
          console.log('readyState', scannerVideoRef.current.readyState)
        }

        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        try {
          const { BrowserMultiFormatReader, BarcodeFormat } = await import('@zxing/browser')
          const { DecodeHintType } = await import('@zxing/library')
          console.log('ZXing BrowserMultiFormatReader import ok')
          const codeReader = new BrowserMultiFormatReader()
          console.log('ZXing BrowserMultiFormatReader constructor ok')
          codeReader.setHints(new Map([
            [DecodeHintType.POSSIBLE_FORMATS, [
              BarcodeFormat.EAN_13,
              BarcodeFormat.EAN_8,
              BarcodeFormat.UPC_A,
              BarcodeFormat.UPC_E,
              BarcodeFormat.CODE_128,
            ]],
          ]))
          scannerInstanceRef.current = codeReader

          const controls = await codeReader.decodeFromStream(stream, scannerVideoRef.current, (result, err) => {
            if (result) {
              const detectedText = result.getText()
              console.log('Barcode detected:', detectedText)
              handleISBNDetected(detectedText)
            } else if (err && err.name !== 'NotFoundException') {
              console.error('ZXing decode error:', err)
            }
          })
          scannerControlsRef.current = controls
          console.log('Waiting for barcode...')
          setIsScannerReady(true)
          setScannerLoading(false)
        } catch (error) {
          console.error('ZXing Error:', error)
          setScannerError(`ZXing initialization failed:\n${error?.name || 'Error'}\n${error?.message || ''}\n${error?.stack || ''}`)
          setScannerLoading(false)
        }
      } catch (error) {
        console.error('getUserMedia failed:', error)
        setScannerError(error?.name || 'Camera failed to start')
        setScannerLoading(false)
      }
    }

    startScanner()
    return () => {
      active = false
      cleanupScanner()
    }
  }, [scannerOpen])

  const pageCount = Math.max(totalPages, 1)

  const loadBooks = async () => {
    setLoading(true)
    setError('')
    try {
      const [booksResponse, statsResponse] = await Promise.all([
        fetchBooks({
          page,
          limit: 10,
          sort: sortBy,
          q: debouncedSearch,
          category: categoryFilter,
          status: availabilityFilter === 'available' ? 'Available' : availabilityFilter === 'unavailable' ? 'Out of Stock' : '',
        }),
        fetchBooks({ page: 1, limit: 1000, sort: 'newest' }),
      ])

      console.log('Books API response:', booksResponse)
      const pageBooks = Array.isArray(booksResponse?.data)
        ? booksResponse.data
        : Array.isArray(booksResponse?.books)
          ? booksResponse.books
          : Array.isArray(booksResponse?.items)
            ? booksResponse.items
            : []
      console.log('Extracted books array:', pageBooks)
      console.log('books.length =', pageBooks.length)

      const overallBooks = Array.isArray(statsResponse?.data)
        ? statsResponse.data
        : Array.isArray(statsResponse?.books)
          ? statsResponse.books
          : Array.isArray(statsResponse?.items)
            ? statsResponse.items
            : []

      const totalCopies = overallBooks.reduce((sum, book) => sum + (Number(book.copies) || 0), 0)
      const availableCopies = overallBooks.reduce((sum, book) => sum + Math.max(Number(book.availableCopies) || 0, 0), 0)
      const issuedBooks = Math.max(totalCopies - availableCopies, 0)
      const unavailableBooks = overallBooks.filter((book) => (Number(book.availableCopies) || 0) === 0).length

      setBooks(pageBooks)
      setTotalPages(booksResponse?.totalPages || 1)
      setSummary({
        totalBooks: booksResponse?.summary?.totalBooks ?? overallBooks.length,
        availableBooks: booksResponse?.summary?.availableBooks ?? availableCopies,
        issuedBooks,
        unavailableBooks,
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load books')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load categories')
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.title.trim()) errors.title = 'Book title is required'
    if (!form.isbn.trim()) errors.isbn = 'ISBN is required'
    if (form.copies == null || Number(form.copies) < 1) errors.copies = 'Total copies must be at least 1'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setSelectedBook(null)
    setIsModalOpen(false)
    setForm(initialFormState)
    setFormErrors({})
  }

  const buildPayload = (payload) => ({
    ...payload,
    publisher: payload.publisher?.trim() || 'Unknown Publisher',
    language: payload.language?.trim() || 'English',
    publishedYear: payload.publishedYear || new Date().getFullYear(),
    edition: payload.edition?.trim() || '1st',
    shelfLocation: payload.shelfLocation?.trim() || 'A1-01',
    copies: Number(payload.copies) || 1,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    setError('')
    try {
      const payload = buildPayload(form)
      if (selectedBook) {
        await updateBook(selectedBook._id, payload)
        toast.success('Book updated successfully.')
      } else {
        await createBook(payload)
        toast.success('Book added successfully.')
      }
      await loadBooks()
      resetForm()
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to save book'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
    setViewBook(null)
    setForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category?._id || '',
      publisher: book.publisher || '',
      language: book.language || '',
      publishedYear: book.publishedYear || '',
      edition: book.edition || '',
      shelfLocation: book.shelfLocation || '',
      copies: book.copies || 1,
      coverImage: book.coverImage || '',
      description: book.description || '',
    })
    setFormErrors({})
  }

  const normalizeISBN = (value = '') => value.replace(/[^0-9Xx]/g, '').trim()

  const validateISBN = (value = '') => {
    const normalized = normalizeISBN(value)
    const isISBN10 = /^\d{9}[\dXx]$/.test(normalized) && normalized.length === 10
    const isISBN13 = /^\d{13}$/.test(normalized) && normalized.length === 13
    return isISBN10 || isISBN13 ? normalized : null
  }

  const cleanupScanner = async () => {
    if (scannerControlsRef.current?.stop) {
      try {
        scannerControlsRef.current.stop()
      } catch (err) {
        console.error('Scanner stop error:', err)
      }
    }
    if (scannerInstanceRef.current?.reset) {
      scannerInstanceRef.current.reset()
      scannerInstanceRef.current = null
    }
    if (scannerVideoRef.current && scannerVideoRef.current.srcObject) {
      const stream = scannerVideoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      scannerVideoRef.current.srcObject = null
    }
    scannerControlsRef.current = null
    scanInFlightRef.current = false
    setIsScannerReady(false)
    setScannerLoading(false)
  }

  const handleScanClose = async () => {
    await cleanupScanner()
    setScannerOpen(false)
    setScannerError('')
    setManualISBN('')
  }

  const fetchBookInfoByISBN = async (isbn) => {
    const cleanedISBN = isbn.replace(/[^0-9Xx]/g, '')
    try {
      setScannerLoading(true)
      const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanedISBN}`)
      const googleData = await googleRes.json()
      if (googleData?.totalItems > 0 && Array.isArray(googleData.items) && googleData.items.length > 0) {
        const volume = googleData.items[0].volumeInfo
        return {
          title: volume.title || '',
          author: Array.isArray(volume.authors) ? volume.authors.join(', ') : volume.authors || '',
          publisher: volume.publisher || '',
          description: volume.description || '',
          coverImage: volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || '',
          publishedYear: volume.publishedDate ? volume.publishedDate.slice(0, 4) : '',
          language: volume.language || '',
          isbn: cleanedISBN,
          edition: volume.edition || '',
        }
      }
    } catch (err) {
      // continue to fallback
    }

    try {
      const openLibraryRes = await fetch(`https://openlibrary.org/isbn/${cleanedISBN}.json`)
      if (openLibraryRes.ok) {
        const openLibraryData = await openLibraryRes.json()
        return {
          title: openLibraryData.title || '',
          author: Array.isArray(openLibraryData.authors) ? openLibraryData.authors.map((a) => a.name).join(', ') : openLibraryData.authors || '',
          publisher: Array.isArray(openLibraryData.publishers) ? openLibraryData.publishers.join(', ') : openLibraryData.publishers || '',
          description: openLibraryData.description?.value || openLibraryData.description || '',
          coverImage: openLibraryData.cover ? `https://covers.openlibrary.org/b/isbn/${cleanedISBN}-L.jpg` : '',
          publishedYear: openLibraryData.publish_date ? openLibraryData.publish_date.slice(-4) : '',
          language: Array.isArray(openLibraryData.languages) ? openLibraryData.languages.map((lang) => lang.key).join(', ') : openLibraryData.languages || '',
          isbn: cleanedISBN,
          edition: openLibraryData.edition_name || openLibraryData.edition || '',
        }
      }
    } catch (err) {
      // fallback failed
    }

    return null
  }

  const fillBookForm = (data) => {
    setForm((prev) => ({
      ...prev,
      title: data?.title || prev.title,
      author: data?.author ?? prev.author,
      publisher: data?.publisher || prev.publisher,
      description: data?.description || prev.description,
      coverImage: data?.coverImage || prev.coverImage,
      publishedYear: data?.publishedYear || prev.publishedYear,
      language: data?.language || prev.language,
      isbn: data?.isbn || prev.isbn,
      edition: data?.edition || prev.edition,
    }))
  }

  const handleISBNLookup = async (isbn) => {
    const normalizedISBN = validateISBN(isbn)
    if (!normalizedISBN) {
      toast.error('Invalid ISBN number.')
      return
    }

    console.log('Fetching book details...')
    await cleanupScanner()
    setScannerOpen(false)
    setScannerLoading(true)
    setScannerError('')

    try {
      const bookData = await fetchBookInfoByISBN(normalizedISBN)
      if (bookData) {
        fillBookForm({ ...bookData, isbn: normalizedISBN })
        setIsModalOpen(true)
        console.log('Book details imported successfully')
        toast.success('Book details imported successfully.')
      } else {
        setForm((prev) => ({ ...prev, isbn: normalizedISBN }))
        setIsModalOpen(true)
        toast.error('No book found for this ISBN.')
      }
    } catch (err) {
      toast.error('Unable to fetch book details.')
      setForm((prev) => ({ ...prev, isbn: normalizedISBN }))
      setIsModalOpen(true)
    } finally {
      setScannerLoading(false)
      setManualISBN('')
    }
  }

  const handleISBNDetected = async (isbn) => {
    if (scanInFlightRef.current) return
    scanInFlightRef.current = true
    await handleISBNLookup(isbn)
  }

  const handleManualISBNSubmit = async (e) => {
    e.preventDefault()
    await handleISBNLookup(manualISBN)
  }
  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    setError('')
    try {
      await deleteBook(deleteTarget._id)
      toast.success('Book deleted successfully.')
      setDeleteTarget(null)
      await loadBooks()
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to delete book'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const getStatusLabel = (book) => {
    const availableCopies = Number(book.availableCopies) || 0
    return availableCopies === 0 ? 'Unavailable' : 'Available'
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Books</p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Manage your library collection efficiently.</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { resetForm(); setViewBook(null); setIsModalOpen(true) }} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
              <FiPlus size={16} /> Add Book
            </button>
            <button onClick={() => setScannerOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-card)]">
              <FiCamera size={16} /> Scan ISBN
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnimatedStatCard icon={<FiBookOpen size={18} />} title="Total Books" value={summary.totalBooks} description="Books currently in catalog" />
        <AnimatedStatCard icon={<FiPackage size={18} />} title="Available Books" value={summary.availableBooks} description="Copies ready to be issued" />
        <AnimatedStatCard icon={<FiClock size={18} />} title="Issued Books" value={summary.issuedBooks} description="Copies currently borrowed" />
        <AnimatedStatCard icon={<FiAlertCircle size={18} />} title="Unavailable Books" value={summary.unavailableBooks} description="Books with no available copies" />
      </div>

      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <label className="flex items-center gap-2 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 shadow-sm">
              <FiSearch className="text-[var(--color-primary)]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author or ISBN" className="w-full border-0 bg-transparent text-sm outline-none" />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-text-2)]">Category</p>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="mt-2 w-full bg-transparent text-sm outline-none">
                <option value="">All</option>
                {(Array.isArray(normalizedCategories) ? normalizedCategories : []).map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-text-2)]">Availability</p>
              <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="mt-2 w-full bg-transparent text-sm outline-none">
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-text-2)]">Sort</p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mt-2 w-full bg-transparent text-sm outline-none">
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
              <div className="h-36 rounded-[18px] bg-[var(--color-background)]" />
              <div className="mt-4 h-4 w-24 rounded-full bg-[var(--color-background)]" />
              <div className="mt-3 h-4 w-32 rounded-full bg-[var(--color-background)]" />
              <div className="mt-3 h-4 w-full rounded-full bg-[var(--color-background)]" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-10 shadow-sm">
          <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/70 px-6 py-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <FiBookOpen size={24} />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[var(--color-text)]">No books available.</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-2)]">Start building your library by adding your first book.</p>
            <button onClick={() => { resetForm(); setViewBook(null); setIsModalOpen(true) }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              <FiPlus size={16} /> Add Your First Book
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {books.map((book) => (
            <div key={book._id} className="group rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)]">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,rgba(182,124,82,0.18),rgba(248,240,224,0.85))] text-[var(--color-text)]">
                      <div className="text-center">
                        <FiImage size={24} />
                        <p className="mt-2 text-sm font-medium">No cover image</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{book.title}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-2)]">{book.author ? book.author : 'Unknown Author'}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--color-background)] px-2.5 py-1 text-[11px] text-[var(--color-text-2)]">{book.category?.name || 'Uncategorized'}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleEdit(book)} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)]">
                    <span className="inline-flex items-center gap-2"><FiEdit2 size={14} /> Edit</span>
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(book)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100">
                    <span className="inline-flex items-center gap-2"><FiTrash2 size={14} /> Delete</span>
                  </button>
                </div>
              </div>
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 shadow-sm">
          <p className="text-sm text-[var(--color-text-2)]">Showing page {page} of {pageCount}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)] disabled:opacity-50">
              <FiChevronLeft size={14} /> Previous
            </button>
            <span className="rounded-full bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)]">{page}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)] disabled:opacity-50">
              Next <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Book?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={saving}
      />

      <Modal open={scannerOpen} onClose={handleScanClose} title="Scan ISBN Barcode">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-black">
            <video ref={scannerVideoRef} className="h-72 w-full object-cover" muted playsInline autoPlay />
            {scannerLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
                {isScannerReady ? 'Fetching book details…' : 'Starting camera…'}
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-2)]">Point your camera at the ISBN barcode. Scanning starts automatically.</p>
            {scannerError ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm whitespace-pre-wrap text-red-700">{scannerError}</div> : null}
          </div>
          <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text)]">OR ENTER ISBN MANUALLY</p>
            <form onSubmit={handleManualISBNSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input value={manualISBN} onChange={(e) => setManualISBN(e.target.value)} placeholder="9780134685991" className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm outline-none" />
              <button type="submit" className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white">Fetch Book Details</button>
            </form>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleScanClose} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)]">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={isModalOpen} onClose={resetForm} title={selectedBook ? 'Update Book' : 'Add Book'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput label="Book Title *" name="title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Book title" error={formErrors.title} />
          <TextInput label="Author" name="author" value={form.author} onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))} placeholder="Author name (optional)" error={formErrors.author} />
          <TextInput label="ISBN" name="isbn" value={form.isbn} onChange={(e) => setForm((prev) => ({ ...prev, isbn: e.target.value }))} placeholder="ISBN number" error={formErrors.isbn} />
          <TextInput label="Publisher" name="publisher" value={form.publisher} onChange={(e) => setForm((prev) => ({ ...prev, publisher: e.target.value }))} placeholder="Publisher" error={formErrors.publisher} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Published Year" name="publishedYear" value={form.publishedYear} onChange={(e) => setForm((prev) => ({ ...prev, publishedYear: e.target.value }))} placeholder="YYYY" />
            <TextInput label="Language" name="language" value={form.language} onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))} placeholder="Language" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Edition" name="edition" value={form.edition} onChange={(e) => setForm((prev) => ({ ...prev, edition: e.target.value }))} placeholder="Edition" />
            <TextInput label="Shelf Location" name="shelfLocation" value={form.shelfLocation} onChange={(e) => setForm((prev) => ({ ...prev, shelfLocation: e.target.value }))} placeholder="Shelf location" />
          </div>
          <SelectInput label="Category" name="category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} options={(Array.isArray(normalizedCategories) ? normalizedCategories : []).map((item) => ({ value: item._id, label: item.name }))} error={formErrors.category} />
          <TextInput label="Total Copies" type="number" name="copies" value={form.copies} onChange={(e) => setForm((prev) => ({ ...prev, copies: Number(e.target.value) }))} placeholder="Total copies" error={formErrors.copies} />
          <TextInput label="Cover Image URL" name="coverImage" value={form.coverImage} onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))} placeholder="https://..." error={formErrors.coverImage} />
          {form.coverImage ? (
            <div className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)]">
              <img src={form.coverImage} alt="Cover preview" className="h-56 w-full object-cover" />
            </div>
          ) : null}
          <TextArea label="Description" name="description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Book description" error={formErrors.description} />
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={resetForm} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)]">Cancel</button>
            <PrimaryButton loading={saving} type="submit">{selectedBook ? 'Update Book' : 'Add Book'}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(viewBook)} onClose={() => setViewBook(null)} title="Book Details">
        {viewBook && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Title</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.title}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Author</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.author}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-text-2)]">ISBN</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.isbn}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Category</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.category?.name || 'Uncategorized'}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Publisher</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.publisher}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Language</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.language}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Year / Edition</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.publishedYear} · {viewBook.edition}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Shelf location</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.shelfLocation}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Available / Total</p>
                <p className="mt-2 text-[var(--color-text)] font-semibold">{viewBook.availableCopies} / {viewBook.copies}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Status</p>
                <div className="mt-2"><StatusBadge status={viewBook.status} /></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-2)]">Description</p>
              <p className="mt-2 text-[var(--color-text)]">{viewBook.description || 'No description available.'}</p>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
