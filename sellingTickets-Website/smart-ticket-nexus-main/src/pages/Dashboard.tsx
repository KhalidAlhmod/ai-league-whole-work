
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { fetchEvents, Event } from "@/services/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Ticket as TicketIcon } from "lucide-react";
import { formatDateTime, formatDate } from "@/utils/dateUtils";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch events
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
  
  const handleViewEventTickets = (event: Event) => {
    navigate(`/event/${event.event_id}/tickets`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.full_name}</h1>
          <p className="text-muted-foreground">
            Browse upcoming events and purchase tickets
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          {isLoadingEvents ? (
            <div className="flex justify-center p-8">
              <div className="loader"></div>
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.event_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription className="text-white/90">
                      {event.team_1 && event.team_2 ? (
                        <span>{event.team_1} vs {event.team_2}</span>
                      ) : (
                        <span>{formatDate(event.date_time)}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDateTime(event.date_time)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    {(event.team_1 || event.team_2) && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {event.team_1 && event.team_2
                            ? `${event.team_1} vs ${event.team_2}`
                            : event.team_1 || event.team_2}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-brand-teal hover:bg-brand-teal/90"
                      onClick={() => handleViewEventTickets(event)}
                    >
                      <TicketIcon className="h-4 w-4 mr-2" />
                      Buy Tickets
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg bg-gray-50">
              <p className="text-muted-foreground">No upcoming events found</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
