import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiAlertCircle } from 'react-icons/fi'
import PrimaryButton from '../../components/auth/PrimaryButton'
import TextInput from '../../components/form/TextInput'
import TextArea from '../../components/form/TextArea'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { fetchCategories, createCategory, updateCategory, deleteCategory, notifyCategoriesChanged } from '../../services/categoryService'

const initialFormState = {
  name: '',
  description: '',
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const shouldLockScroll = isModalOpen || Boolean(deleteTarget)
    document.body.style.overflow = shouldLockScroll ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen, deleteTarget])

  const loadCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to load categories'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Category name is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setIsModalOpen(false)
    setForm(initialFormState)
    setFormErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    setError('')
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory._id, form)
        toast.success('Category updated successfully.')
      } else {
        await createCategory(form)
        toast.success('Category created successfully.')
      }
      await loadCategories()
      notifyCategoriesChanged()
      resetForm()
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to save category'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
    setForm({
      name: category.name || '',
      description: category.description || '',
    })
    setFormErrors({})
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    setError('')
    try {
      await deleteCategory(deleteTarget._id)
      toast.success('Category deleted successfully.')
      setDeleteTarget(null)
      await loadCategories()
      notifyCategoriesChanged()
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to delete category'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Categories</p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Organize and maintain your collection with ease.</h1>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
            <FiPlus size={16} /> Add Category
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
              <div className="h-4 w-24 rounded-full bg-[var(--color-background)]" />
              <div className="mt-4 h-4 w-full rounded-full bg-[var(--color-background)]" />
              <div className="mt-3 h-4 w-3/4 rounded-full bg-[var(--color-background)]" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-10 shadow-sm">
          <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-background)]/70 px-6 py-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <FiFolder size={24} />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[var(--color-text)]">No categories yet.</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-2)]">Create the first category to start organizing your collection.</p>
            <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              <FiPlus size={16} /> Add Your First Category
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <div key={category._id} className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{category.name}</p>
                  <p className="mt-2 text-sm text-[var(--color-text-2)]">{category.description || 'No description provided.'}</p>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <FiFolder size={18} />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => handleEdit(category)} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)]">
                  <span className="inline-flex items-center gap-2"><FiEdit2 size={14} /> Edit</span>
                </button>
                <button type="button" onClick={() => setDeleteTarget(category)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100">
                  <span className="inline-flex items-center gap-2"><FiTrash2 size={14} /> Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Category?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={saving}
      />

      <Modal open={isModalOpen} onClose={resetForm} title={selectedCategory ? 'Update Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput label="Category Name *" name="name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Category name" error={formErrors.name} />
          <TextArea label="Description" name="description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Category description" error={formErrors.description} />
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={resetForm} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)]">Cancel</button>
            <PrimaryButton loading={saving} type="submit">{selectedCategory ? 'Update Category' : 'Add Category'}</PrimaryButton>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
