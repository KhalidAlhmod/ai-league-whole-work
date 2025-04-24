
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchTicketsByUser,
  resellTicket,
  Ticket,
} from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";

const MyTickets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resalePrice, setResalePrice] = useState("");

  // Fetch user tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["userTickets", user?.user_id],
    queryFn: () => (user ? fetchTicketsByUser(user.user_id) : Promise.resolve([])),
    enabled: !!user,
  });

  // Mutation for reselling a ticket
  const resellMutation = useMutation({
    mutationFn: ({ ticketId, price }: { ticketId: number; price: number }) =>
      resellTicket(ticketId, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTickets"] });
      toast({
        title: "Success!",
        description: "Your ticket has been listed for resale.",
        variant: "default",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resell ticket.",
        variant: "destructive",
      });
    },
  });

  const handleOpenResellDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResalePrice(ticket.price.toString());
    setIsDialogOpen(true);
  };

  const handleResellTicket = async () => {
    if (!selectedTicket) return;

    const price = parseFloat(resalePrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    resellMutation.mutate({
      ticketId: selectedTicket.ticket_id,
      price,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground">
            Manage your purchased tickets
          </p>
        </div>

        <div className="rounded-md border">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="loader"></div>
            </div>
          ) : tickets && tickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.ticket_id}>
                    <TableCell className="font-medium">#{ticket.ticket_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.event?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.event?.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(ticket.event?.date_time || "")}</TableCell>
                    <TableCell>{formatCurrency(ticket.price)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {ticket.is_resold ? (
                          <Badge className="bg-amber-500">Resold</Badge>
                        ) : ticket.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="outline">Listed for Resale</Badge>
                        )}
                        {ticket.resale_count > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Resold {ticket.resale_count} time
                            {ticket.resale_count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ticket.is_active && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenResellDialog(ticket)}
                        >
                          Resell
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">You don't have any tickets yet</p>
            </div>
          )}
        </div>

        {/* Resell Ticket Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Resell Ticket</DialogTitle>
              <DialogDescription>
                Set a price to list your ticket for resale.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ticket Info</p>
                <p>
                  {selectedTicket?.event?.name} - {formatDate(selectedTicket?.event?.date_time || "")}
                </p>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="price" className="text-sm font-medium">
                  Resale Price
                </label>
                <div className="flex items-center">
                  <span className="mr-1">$</span>
                  <Input
                    id="price"
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Original price: {formatCurrency(selectedTicket?.price || 0)}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleResellTicket} 
                disabled={resellMutation.isPending}
              >
                {resellMutation.isPending ? (
                  <>
                    <span className="loader mr-2"></span>
                    Listing...
                  </>
                ) : (
                  "List for Resale"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MyTickets;
