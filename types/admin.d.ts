/** Shared contracts for back-office modules. Money is whole major units. */
export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type EnquiryStatus = 'new' | 'quoted' | 'won' | 'closed'

export interface OrderItem { id: string; name: string; qty: number; price: number }
export interface Order {
  id: string; at: number; status: OrderStatus; payment: PaymentStatus; pay: string
  customer: { name: string; phone: string; email?: string; city: string; address: string }
  items: OrderItem[]; sub: number; disc: number; fee: number; total: number
  date: string; slot: string; msg?: string; notes?: { at: number; by: string; text: string }[]
  history: { at: number; status: OrderStatus; by: string }[]
}
export interface Product {
  id: string; name: string; price: number; was?: number; stock: number; fee: number; line?: string
  inside: string[]; tags: string[]; occ?: string[]; active?: boolean; img: string; photo?: string; custom?: boolean
}
export interface Customer { id: string; name: string; phone: string; email?: string; city?: string; notes?: string; created: number }
export interface Enquiry { id: string; at: number; name: string; phone?: string; email?: string; occasion?: string; brief: string; item?: string; status: EnquiryStatus; quote?: number; reply?: string }
export interface PromoCode { id: string; code: string; pct: number; active: boolean; expires?: string; limit?: number; used: number }
export interface StockMove { id: string; at: number; productId: string; delta: number; reason: string; by: string }
export interface ActivityEntry { id: string; at: number; by: string; action: string; target: string }
export interface Session { email: string; name: string; role: 'owner' | 'manager' | 'staff' | 'viewer'; at: number }
