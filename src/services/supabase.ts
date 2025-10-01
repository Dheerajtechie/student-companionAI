import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Detect if Supabase env is configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Basic local storage helpers
const storageKey = (table: string) => `sc-localdb:${table}`
const readTable = <T = any>(table: string): T[] => {
  try {
    const raw = localStorage.getItem(storageKey(table))
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}
const writeTable = (table: string, rows: any[]) => {
  localStorage.setItem(storageKey(table), JSON.stringify(rows))
}

// Minimal query builder for local mode
class LocalQueryBuilder {
  private table: string
  private rows: any[]
  private filters: Array<(row: any) => boolean> = []
  private _single = false
  private _orderKey: string | null = null
  private _ascending = true
  private _limit: number | null = null
  private _operation: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private _payload: any = null

  constructor(table: string) {
    this.table = table
    this.rows = readTable(table)
  }

  select() {
    this._operation = 'select'
    return this
  }

  eq(key: string, value: any) {
    this.filters.push((row) => row[key] === value)
    return this
  }

  ilike(key: string, pattern: string) {
    const needle = pattern.replace(/%/g, '').toLowerCase()
    this.filters.push((row) => String(row[key] || '').toLowerCase().includes(needle))
    return this
  }

  in(key: string, values: any[]) {
    this.filters.push((row) => values.includes(row[key]))
    return this
  }

  gte(key: string, value: string) {
    this.filters.push((row) => String(row[key]) >= value)
    return this
  }

  lte(key: string, value: string) {
    this.filters.push((row) => String(row[key]) <= value)
    return this
  }

  order(key: string, opts?: { ascending?: boolean }) {
    this._orderKey = key
    this._ascending = opts?.ascending !== false
    return this
  }

  limit(n: number) {
    this._limit = n
    return this
  }

  single() {
    this._single = true
    return this
  }

  insert(payload: any | any[]) {
    this._operation = 'insert'
    this._payload = Array.isArray(payload) ? payload : [payload]
    return this
  }

  update(payload: Record<string, any>) {
    this._operation = 'update'
    this._payload = payload
    return this
  }

  delete() {
    this._operation = 'delete'
    return this
  }

  then(onfulfilled: any, onrejected?: any) {
    this.execute()
      .then(onfulfilled, onrejected)
  }

  private async execute() {
    switch (this._operation) {
      case 'insert': {
        const now = new Date().toISOString()
        const arr = (this._payload as any[]).map((item) => ({
          id: item.id || crypto.randomUUID(),
          created_at: item.created_at || now,
          updated_at: item.updated_at || now,
          ...item,
        }))
        const all = [...this.rows, ...arr]
        writeTable(this.table, all)
        const data = this._single ? arr[0] : arr
        return { data, error: null }
      }
      case 'update': {
        const filtered = this.applyFilters(this.rows)
        const ids = new Set(filtered.map((r) => r.id))
        const now = new Date().toISOString()
        const updated = this.rows.map((row) =>
          ids.has(row.id)
            ? { ...row, ...(this._payload as any), updated_at: now }
            : row
        )
        writeTable(this.table, updated)
        const updatedRows = this.applyFilters(updated)
        const data = this._single ? updatedRows[0] : updatedRows
        return { data, error: null }
      }
      case 'delete': {
        const filtered = this.applyFilters(this.rows)
        const ids = new Set(filtered.map((r) => r.id))
        const remaining = this.rows.filter((row) => !ids.has(row.id))
        writeTable(this.table, remaining)
        return { data: null, error: null }
      }
      case 'select':
      default: {
        const data = this.applyFilters(this.rows)
        const ordered = this.applyOrder(data)
        const limited = this._limit != null ? ordered.slice(0, this._limit) : ordered
        return { data: this._single ? limited[0] : limited, error: null }
      }
    }
  }

  private applyFilters(rows: any[]) {
    if (this.filters.length === 0) return rows
    return rows.filter((row) => this.filters.every((f) => f(row)))
  }

  private applyOrder(rows: any[]) {
    if (!this._orderKey) return rows
    const sorted = [...rows].sort((a, b) => {
      const av = a[this._orderKey as string]
      const bv = b[this._orderKey as string]
      if (av === bv) return 0
      return av > bv ? 1 : -1
    })
    return this._ascending ? sorted : sorted.reverse()
  }
}

// Minimal local auth shim
type LocalUser = {
  id: string
  email: string
  password: string
  user_metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

class LocalAuth {
  private listeners: Array<(event: string, session: { user: any } | null) => void> = []

  private get users(): LocalUser[] {
    return readTable<LocalUser>('__users')
  }
  private set users(list: LocalUser[]) {
    writeTable('__users', list)
  }

  private get currentUserId(): string | null {
    return localStorage.getItem('sc-localdb:currentUserId')
  }
  private set currentUserId(id: string | null) {
    if (id) localStorage.setItem('sc-localdb:currentUserId', id)
    else localStorage.removeItem('sc-localdb:currentUserId')
  }

  private get currentUser(): LocalUser | null {
    const id = this.currentUserId
    if (!id) return null
    return this.users.find((u) => u.id === id) || null
  }

  onAuthStateChange(cb: (event: string, session: { user: any } | null) => void) {
    this.listeners.push(cb)
    return { data: { subscription: { unsubscribe: () => {
      this.listeners = this.listeners.filter((l) => l !== cb)
    } } }, error: null }
  }

  private emit(event: string) {
    const user = this.currentUser
    const session = user ? { user } : null
    this.listeners.forEach((l) => l(event, session))
  }

  async getSession() {
    const user = this.currentUser
    return { data: { session: user ? { user } : null }, error: null }
  }

  async getUser() {
    const user = this.currentUser
    return { data: { user }, error: null }
  }

  async signInWithPassword(opts: { email: string; password: string }) {
    const user = this.users.find((u) => u.email === opts.email && u.password === opts.password)
    if (!user) {
      return { data: { user: null }, error: { message: 'Invalid credentials' } as any }
    }
    this.currentUserId = user.id
    this.emit('SIGNED_IN')
    return { data: { user }, error: null }
  }

  async signUp(opts: { email: string; password: string; options?: { data?: any } }) {
    const exists = this.users.some((u) => u.email === opts.email)
    if (exists) {
      return { data: { user: null }, error: { message: 'User already exists' } as any }
    }
    const now = new Date().toISOString()
    const user: LocalUser = {
      id: crypto.randomUUID(),
      email: opts.email,
      password: opts.password,
      user_metadata: opts.options?.data || {},
      created_at: now,
      updated_at: now,
    }
    this.users = [...this.users, user]
    this.currentUserId = user.id
    this.emit('SIGNED_IN')
    return { data: { user }, error: null }
  }

  async signOut() {
    this.currentUserId = null
    this.emit('SIGNED_OUT')
    return { error: null }
  }

  async resetPasswordForEmail() {
    return { error: null }
  }

  async updateUser(update: { password?: string }) {
    const user = this.currentUser
    if (!user) return { error: { message: 'Not authenticated' } as any }
    if (update.password) {
      const list = this.users.map((u) => (u.id === user.id ? { ...u, password: update.password, updated_at: new Date().toISOString() } : u))
      this.users = list
    }
    return { error: null }
  }
}

class LocalSupabaseClient {
  auth = new LocalAuth()
  from(table: string) {
    return new LocalQueryBuilder(table)
  }
}

export const supabase: any = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : new LocalSupabaseClient()

