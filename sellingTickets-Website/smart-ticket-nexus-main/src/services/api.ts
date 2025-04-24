import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/hooks/useAuth";

export interface Event {
  event_id: number;
  name: string;
  date_time: string;
  location: string;
  team_1: string | null;
  team_2: string | null;
  created_at: string;
}

export interface Ticket {
  ticket_id: number;
  event_id: number;
  owner_user_id: number;
  purchase_date: string;
  is_resold: boolean;
  resale_count: number;
  price: number;
  is_active: boolean;
  event?: Event;
}

export interface Transaction {
  transaction_id: number;
  ticket_id: number;
  buyer_user_id: number;
  seller_user_id: number | null;
  transaction_date: string;
  price: number;
  payment_status: string;
  ticket?: Ticket;
  buyer?: User;
  seller?: User;
}

export interface TicketDatasetItem {
  ticket_id: number;
  ticket_type: "active" | "inactive";
  price: number;
  price_vs_typical: number;
  is_resold: boolean;
  resale_count: number;
  days_before_event: number;
  owner_is_local: boolean;
  team_supported: string | null;
  event_team: string;
}

export const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date_time', { ascending: true });
  
  if (error) throw error;
  return data as Event[];
};

export const fetchEventById = async (eventId: number) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_id', eventId)
    .single();
  
  if (error) throw error;
  return data as Event;
};

export const createEvent = async (event: Omit<Event, 'event_id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select();
  
  if (error) throw error;
  return data[0] as Event;
};

export const updateEvent = async (eventId: number, event: Partial<Event>) => {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('event_id', eventId)
    .select();
  
  if (error) throw error;
  return data[0] as Event;
};

export const deleteEvent = async (eventId: number) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('event_id', eventId);
  
  if (error) throw error;
};

export const fetchTicketsByUser = async (userId: number) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*)
    `)
    .eq('owner_user_id', userId)
    .order('purchase_date', { ascending: false });
  
  if (error) throw error;
  return data as (Ticket & { event: Event })[];
};

export const fetchAvailableTicketsForEvent = async (eventId: number) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*)
    `)
    .eq('event_id', eventId)
    .eq('is_active', true)
    .order('price', { ascending: true });
  
  if (error) throw error;
  return data as (Ticket & { event: Event })[];
};

export const createTicket = async (ticket: Omit<Ticket, 'ticket_id' | 'purchase_date' | 'is_resold' | 'resale_count'>) => {
  const { data, error } = await supabase
    .from('tickets')
    .insert([{
      ...ticket,
      is_resold: false,
      resale_count: 0
    }])
    .select();
  
  if (error) throw error;
  return data ? data[0] as Ticket : null;
};

export const purchaseTicket = async (ticketId: number, buyerId: number, sellerId: number | null, price: number) => {
  const { error: transactionError, data: transactionData } = await supabase
    .from('transactions')
    .insert([{
      ticket_id: ticketId,
      buyer_user_id: buyerId,
      seller_user_id: sellerId,
      price: price,
      payment_status: 'paid'
    }])
    .select();
  
  if (transactionError) throw transactionError;
  
  const { data: ticketData, error: ticketFetchError } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_id', ticketId)
    .single();
    
  if (ticketFetchError) throw ticketFetchError;
  
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      owner_user_id: buyerId,
      is_resold: true,
      resale_count: ticketData.is_resold ? ticketData.resale_count + 1 : 1,
      purchase_date: new Date().toISOString(),
      is_active: false
    })
    .eq('ticket_id', ticketId);
  
  if (updateError) throw updateError;
  
  return transactionData[0] as Transaction;
};

export const resellTicket = async (ticketId: number, newPrice: number) => {
  const { data, error } = await supabase
    .from('tickets')
    .update({
      price: newPrice,
      is_active: true
    })
    .eq('ticket_id', ticketId)
    .select();
  
  if (error) throw error;
  return data[0] as Ticket;
};

export const fetchTransactionsByUser = async (userId: number) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      ticket:tickets(*, event:events(*)),
      buyer:users!buyer_user_id(user_id, full_name, email),
      seller:users!seller_user_id(user_id, full_name, email)
    `)
    .or(`buyer_user_id.eq.${userId},seller_user_id.eq.${userId}`)
    .order('transaction_date', { ascending: false });
  
  if (error) throw error;
  
  return data as Transaction[];
};

export const exportTicketsDataset = async (): Promise<string> => {
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('ticket_id, event_id, owner_user_id, price, is_resold, resale_count, purchase_date, is_active');

  if (ticketsError) throw ticketsError;
  if (!tickets || tickets.length === 0) {
    throw new Error('No ticket data available to export');
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('event_id, date_time, team_1, team_2');
  
  if (eventsError) throw eventsError;

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('user_id, is_local, team_supported');
  
  if (usersError) throw usersError;

  const eventPrices: Record<number, number[]> = {};
  tickets.forEach(ticket => {
    if (!eventPrices[ticket.event_id]) {
      eventPrices[ticket.event_id] = [];
    }
    eventPrices[ticket.event_id].push(ticket.price);
  });

  const eventAverages: Record<number, number> = {};
  Object.entries(eventPrices).forEach(([eventId, prices]) => {
    const sum = prices.reduce((acc, price) => acc + price, 0);
    eventAverages[Number(eventId)] = sum / prices.length;
  });

  const dataset: TicketDatasetItem[] = tickets.map(ticket => {
    const event = events.find(e => e.event_id === ticket.event_id);
    const user = users.find(u => u.user_id === ticket.owner_user_id);
    
    if (!event || !user) {
      throw new Error('Missing event or user data for some tickets');
    }
    
    const eventDate = new Date(event.date_time);
    const purchaseDate = new Date(ticket.purchase_date);
    const daysDifference = Math.floor((eventDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const eventTeam = event.team_1 && event.team_2 
      ? `${event.team_1} vs ${event.team_2}` 
      : 'No teams specified';

    return {
      ticket_id: ticket.ticket_id,
      ticket_type: ticket.is_active ? "active" : "inactive",
      price: ticket.price,
      price_vs_typical: ticket.price - (eventAverages[ticket.event_id] || 0),
      is_resold: ticket.is_resold,
      resale_count: ticket.resale_count,
      days_before_event: daysDifference,
      owner_is_local: user.is_local,
      team_supported: user.team_supported,
      event_team: eventTeam
    };
  });

  const headers = Object.keys(dataset[0]).join(',');
  const rows = dataset.map(item => 
    Object.values(item)
      .map(value => typeof value === 'string' ? `"${value}"` : value)
      .join(',')
  );
  
  return `${headers}\n${rows.join('\n')}`;
};
