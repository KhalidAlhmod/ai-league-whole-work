
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { 
  fetchAvailableTicketsForEvent, 
  fetchEventById, 
  purchaseTicket, 
  Event, 
  Ticket 
} from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, ArrowLeft, Ticket as TicketIcon } from "lucide-react";
import { formatDateTime } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const EventTickets = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("price_asc");
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  // Fetch event details
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventById(Number(eventId)),
    enabled: !!eventId,
  });

  // Fetch available tickets for the event
  const { 
    data: availableTickets, 
    isLoading: isLoadingTickets,
    refetch: refetchAvailableTickets 
  } = useQuery({
    queryKey: ["availableTickets", eventId],
    queryFn: () => fetchAvailableTicketsForEvent(Number(eventId)),
    enabled: !!eventId,
  });

  const handlePurchaseTicket = async (ticketId: number, price: number) => {
    if (!user) return;
    
    try {
      setIsPurchasing(true);
      
      await purchaseTicket(
        ticketId,
        user.user_id,
        null, // No seller for new tickets
        price
      );
      
      await refetchAvailableTickets();
      
      toast({
        title: "Success!",
        description: "Your ticket has been purchased.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to purchase ticket.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  // Filter and sort tickets
  const filteredAndSortedTickets = availableTickets
    ? availableTickets
        .filter(ticket => 
          ticket.ticket_id.toString().includes(searchTerm) ||
          ticket.price.toString().includes(searchTerm)
        )
        .sort((a, b) => {
          switch (sortBy) {
            case "price_asc":
              return a.price - b.price;
            case "price_desc":
              return b.price - a.price;
            case "id_asc":
              return a.ticket_id - b.ticket_id;
            case "id_desc":
              return b.ticket_id - a.ticket_id;
            case "resold_first":
              return Number(b.is_resold) - Number(a.is_resold);
            default:
              return a.price - b.price;
          }
        })
    : [];

  // Pagination
  const totalPages = Math.ceil(
    (filteredAndSortedTickets?.length || 0) / ticketsPerPage
  );
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredAndSortedTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const goBack = () => {
    navigate("/dashboard");
  };

  if (isLoadingEvent) {
    return (
      <Layout>
        <div className="flex justify-center p-8">
          <div className="loader"></div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center p-8">
          <p>Event not found</p>
          <Button variant="outline" onClick={goBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground">
              {formatDateTime(event.date_time)} • {event.location}
              {event.team_1 && event.team_2 && (
                <span> • {event.team_1} vs {event.team_2}</span>
              )}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Tickets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                <div className="w-full sm:w-auto">
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="max-w-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sort options</SelectLabel>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="id_asc">Ticket ID: Ascending</SelectItem>
                        <SelectItem value="id_desc">Ticket ID: Descending</SelectItem>
                        <SelectItem value="resold_first">Resold First</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoadingTickets ? (
                <div className="flex justify-center p-8">
                  <div className="loader"></div>
                </div>
              ) : currentTickets.length > 0 ? (
                <div className="space-y-2">
                  {currentTickets.map((ticket) => (
                    <div
                      key={ticket.ticket_id}
                      className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-medium flex items-center">
                          <TicketIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          Ticket #{ticket.ticket_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.resale_count > 0
                            ? `Resold ${ticket.resale_count} time${ticket.resale_count > 1 ? "s" : ""}`
                            : "Original ticket"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-lg">
                          {formatCurrency(ticket.price)}
                        </p>
                        <Button
                          onClick={() =>
                            handlePurchaseTicket(ticket.ticket_id, ticket.price)
                          }
                          disabled={isPurchasing}
                        >
                          {isPurchasing ? (
                            <span className="loader"></span>
                          ) : (
                            "Buy"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No tickets match your search</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {pageNumbers.map(number => (
                      <PaginationItem key={number}>
                        <PaginationLink
                          onClick={() => setCurrentPage(number)}
                          isActive={currentPage === number}
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EventTickets;
