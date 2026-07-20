import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addTicketMessage,
  createTicket,
  getAllTickets,
  getTicket,
  getTicketMessages,
  getTicketsForUser,
  updateTicketStatus,
} from '@/lib/data/tickets'
import { queryKeys } from '@/lib/queries/keys'
import type { TicketStatus, UserRole } from '@/types/database'
import type { NewTicketInput } from '@/types/domain'

export function useTicketsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ticketsForUser(userId ?? ''),
    queryFn: () => getTicketsForUser(userId!),
    enabled: Boolean(userId),
  })
}

export function useAllTickets() {
  return useQuery({ queryKey: queryKeys.allTickets, queryFn: getAllTickets })
}

export function useTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ticket(ticketId ?? ''),
    queryFn: () => getTicket(ticketId!),
    enabled: Boolean(ticketId),
  })
}

export function useTicketMessages(ticketId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ticketMessages(ticketId ?? ''),
    queryFn: () => getTicketMessages(ticketId!),
    enabled: Boolean(ticketId),
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, authorName, input }: { userId: string; authorName: string; input: NewTicketInput }) =>
      createTicket(userId, authorName, input),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketsForUser(ticket.user_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.allTickets })
    },
  })
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ticketId,
      authorRole,
      authorName,
      message,
    }: {
      ticketId: string
      authorRole: UserRole
      authorName: string
      message: string
    }) => addTicketMessage(ticketId, authorRole, authorName, message),
    onSuccess: (_message, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketMessages(variables.ticketId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.ticket(variables.ticketId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.allTickets })
    },
  })
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) => updateTicketStatus(ticketId, status),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticket(ticket.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.allTickets })
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketsForUser(ticket.user_id) })
    },
  })
}
