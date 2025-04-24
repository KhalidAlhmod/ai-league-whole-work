
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { fetchTransactionsByUser } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatShortDateTime } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/formatters";
import { Search, Calendar, FilterX } from "lucide-react";

const Transactions = () => {
  const { user } = useAuth();
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["userTransactions", user?.user_id],
    queryFn: () => (user ? fetchTransactionsByUser(user.user_id) : Promise.resolve([])),
    enabled: !!user,
  });

  // Get unique events for filter
  const events = transactions
    ? Array.from(
        new Set(transactions.map((t) => t.ticket?.event?.name || ""))
      ).filter(Boolean)
    : [];

  // Apply filters
  const filteredTransactions = transactions
    ? transactions.filter((transaction) => {
        const matchesEvent = eventFilter === "all" || transaction.ticket?.event?.name === eventFilter;
        
        let matchesDateRange = true;
        if (startDateFilter && endDateFilter) {
          const transactionDate = new Date(transaction.transaction_date);
          const startDate = new Date(startDateFilter);
          const endDate = new Date(endDateFilter);
          endDate.setHours(23, 59, 59); // Include the entire end date
          
          matchesDateRange = transactionDate >= startDate && transactionDate <= endDate;
        }
        
        return matchesEvent && matchesDateRange;
      })
    : [];

  const resetFilters = () => {
    setEventFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            View your purchase and resale transaction history
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-md border shadow-sm">
          <h2 className="text-lg font-medium mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Event</label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event} value={event}>
                      {event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <div className="flex">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground self-center" />
                <Input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">End Date</label>
              <div className="flex">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground self-center" />
                <Input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={resetFilters}
              >
                <FilterX className="w-4 h-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="loader"></div>
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Other Party</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  // Determine if user is buyer or seller
                  const isBuyer = transaction.buyer_user_id === user?.user_id;
                  const otherParty = isBuyer
                    ? transaction.seller?.full_name || "System"
                    : transaction.buyer?.full_name || "Unknown";
                    
                  return (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell className="font-medium">#{transaction.transaction_id}</TableCell>
                      <TableCell>{formatShortDateTime(transaction.transaction_date)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transaction.ticket?.event?.name || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ticket #{transaction.ticket_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={isBuyer ? "bg-blue-500" : "bg-green-500"}>
                          {isBuyer ? "Purchase" : "Sale"}
                        </Badge>
                      </TableCell>
                      <TableCell>{otherParty}</TableCell>
                      <TableCell>{formatCurrency(transaction.price)}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.payment_status === "paid" ? "default" : "outline"}>
                          {transaction.payment_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8">
              <Search className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions found with the selected filters</p>
              {(eventFilter !== "all" || startDateFilter || endDateFilter) && (
                <Button variant="link" onClick={resetFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Transactions;
