'use client'

import React, { type FormEvent, type ReactNode, useState, useCallback } from 'react'
import type { ValidationResult, ValidationError, ValidationWarning } from '@/lib/errorHandling'
import { Button } from './Button'

interface ValidatedFormProps {
  children: ReactNode
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>
  validator?: (data: Record<string, unknown>) => ValidationResult
  className?: string
  submitLabel?: string
  enableRealTimeValidation?: boolean
  showWarnings?: boolean
}

interface FormFieldProps {
  name: string
  label: string
  type?: 'text' | 'number' | 'email' | 'tel' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  pattern?: string
  className?: string
  disabled?: boolean
  onChange?: (value: string | number | boolean) => void
  children?: ReactNode // select要素のoption用
}

export function ValidatedForm({
  children,
  onSubmit,
  validator,
  className = '',
  submitLabel = '送信',
  enableRealTimeValidation = true,
  showWarnings = true
}: ValidatedFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [warnings, setWarnings] = useState<ValidationWarning[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  const validateForm = useCallback((data: Record<string, unknown>): ValidationResult => {
    if (!validator) {
      return { isValid: true, errors: [], warnings: [] }
    }
    return validator(data)
  }, [validator])

  const handleFieldChange = useCallback((name: string, value: unknown) => {
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)

    // リアルタイムバリデーション
    if (enableRealTimeValidation && hasValidated) {
      const result = validateForm(updatedData)
      setErrors(result.errors)
      setWarnings(showWarnings ? result.warnings : [])
    }
  }, [formData, validateForm, enableRealTimeValidation, hasValidated, showWarnings])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setHasValidated(true)

    try {
      // バリデーション実行
      const validationResult = validateForm(formData)
      setErrors(validationResult.errors)
      setWarnings(showWarnings ? validationResult.warnings : [])

      if (validationResult.isValid) {
        await onSubmit(formData)
      } else {
        // 最初のエラーフィールドにフォーカス
        const firstErrorField = document.querySelector(`[name="${validationResult.errors[0]?.field}"]`) as HTMLElement
        if (firstErrorField) {
          firstErrorField.focus()
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldError = (fieldName: string): ValidationError | undefined => {
    return errors.find(error => error.field === fieldName || error.field.startsWith(`${fieldName}.`))
  }

  const getFieldWarning = (fieldName: string): ValidationWarning | undefined => {
    return warnings.find(warning => warning.field === fieldName || warning.field.startsWith(`${fieldName}.`))
  }

  const hasErrors = errors.length > 0

  return (
    <form onSubmit={(e) => { void handleSubmit(e) }} className={`space-y-6 ${className}`}>
      {/* エラーサマリー */}
      {hasErrors && hasValidated && (
        <div className="card p-4 border-red-300 bg-red-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                入力内容を確認してください
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
                {errors.length > 5 && (
                  <li>他 {errors.length - 5} 件のエラーがあります</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 警告サマリー */}
      {warnings.length > 0 && showWarnings && hasValidated && (
        <div className="card p-4 border-yellow-300 bg-yellow-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                注意事項があります
              </h3>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                {warnings.slice(0, 3).map((warning, index) => (
                  <li key={index}>{warning.message}</li>
                ))}
                {warnings.length > 3 && (
                  <li>他 {warnings.length - 3} 件の注意事項があります</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* フォームフィールド */}
      <FormProvider
        formData={formData}
        onFieldChange={handleFieldChange}
        getFieldError={getFieldError}
        getFieldWarning={getFieldWarning}
        showWarnings={showWarnings}
      >
        {children}
      </FormProvider>

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-3">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || (hasValidated && hasErrors)}
          className="min-w-24"
        >
          {isSubmitting ? '送信中...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

// フォームコンテキスト
import { createContext, useContext } from 'react'

interface FormContextType {
  formData: Record<string, unknown>
  onFieldChange: (name: string, value: unknown) => void
  getFieldError: (fieldName: string) => ValidationError | undefined
  getFieldWarning: (fieldName: string) => ValidationWarning | undefined
  showWarnings: boolean
}

const FormContext = createContext<FormContextType | null>(null)

interface FormProviderProps {
  children: ReactNode
  formData: Record<string, unknown>
  onFieldChange: (name: string, value: unknown) => void
  getFieldError: (fieldName: string) => ValidationError | undefined
  getFieldWarning: (fieldName: string) => ValidationWarning | undefined
  showWarnings: boolean
}

function FormProvider({
  children,
  formData,
  onFieldChange,
  getFieldError,
  getFieldWarning,
  showWarnings
}: FormProviderProps) {
  const value: FormContextType = {
    formData,
    onFieldChange,
    getFieldError,
    getFieldWarning,
    showWarnings
  }

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

function useFormContext(): FormContextType {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('FormField must be used within ValidatedForm')
  }
  return context
}

// フォームフィールドコンポーネント
export function FormField({
  name,
  label,
  type = 'text',
  required = false,
  placeholder,
  options,
  min,
  max,
  step,
  pattern,
  className = '',
  disabled = false,
  onChange,
  children
}: FormFieldProps): React.JSX.Element {
  const { formData, onFieldChange, getFieldError, getFieldWarning, showWarnings } = useFormContext()
  
  const fieldError = getFieldError(name)
  const fieldWarning = getFieldWarning(name)
  const value = formData[name] || ''

  const handleChange = (newValue: unknown) => {
    onFieldChange(name, newValue)
    if (onChange) {
      onChange(newValue as string | number | boolean)
    }
  }

  const fieldId = `field-${name}`
  const hasError = !!fieldError
  const hasWarning = !!fieldWarning && showWarnings

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      disabled,
      className: `form-input ${className} ${hasError ? 'border-red-500' : hasWarning ? 'border-yellow-500' : ''}`
    }

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={value as string}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
          />
        )

      case 'select':
        return (
          <select
            {...commonProps}
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">選択してください</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {children}
          </select>
        )

      case 'checkbox':
        return (
          <input
            {...commonProps}
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(e.target.checked)}
            className={`form-checkbox ${className}`}
          />
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(e.target.value)}
                  className="form-radio mr-2"
                  disabled={disabled}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            value={value as string}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleChange(e.target.valueAsNumber || 0)}
          />
        )

      default:
        return (
          <input
            {...commonProps}
            type={type}
            value={value as string}
            placeholder={placeholder}
            pattern={pattern}
            onChange={(e) => handleChange(e.target.value)}
          />
        )
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {fieldError.message}
        </p>
      )}
      
      {hasWarning && (
        <p className="text-sm text-yellow-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {fieldWarning.message}
        </p>
      )}
    </div>
  )
}