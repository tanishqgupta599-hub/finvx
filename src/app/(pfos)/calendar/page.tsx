"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isValid } from "date-fns";
import { ChevronLeft, ChevronRight, CreditCard, RefreshCw, Wallet, Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarEvent } from "@/domain/models";

export default function CalendarPage() {
  const { subscriptions, creditCards, loans, transactions, calendarEvents, addCalendarEvent, removeCalendarEvent } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState<"bill" | "income" | "other">("other");
  const [newIsRecurring, setNewIsRecurring] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Aggregate events
  const getEventsForDay = (day: Date) => {
    const events: { 
      id: string; 
      title: string; 
      amount: number; 
      type: string; 
      color: string;
      isCustom?: boolean;
    }[] = [];

    // Subscriptions
    subscriptions.forEach(sub => {
      if (!sub.nextChargeDate) return;
      const date = parseISO(sub.nextChargeDate);
      const dayOfMonth = date.getDate();
      if (day.getDate() === dayOfMonth) {
         events.push({
           id: sub.id,
           title: sub.name,
           amount: sub.amount,
           type: 'sub',
           color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
         });
      }
    });

    // Credit Cards Bills
    creditCards.forEach(card => {
      if (!card.billDueDate) return;
      const date = parseISO(card.billDueDate);
      if (day.getDate() === date.getDate()) {
        events.push({
          id: card.id,
          title: `${card.brand.toUpperCase()} Bill`,
          amount: card.billAmount || 0,
          type: 'bill',
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        });
      }
    });

    // Custom Calendar Events
    calendarEvents.forEach(event => {
      const eventDate = parseISO(event.date);
      let matches = false;
      
      if (event.isRecurring) {
         matches = eventDate.getDate() === day.getDate();
      } else {
         matches = isSameDay(eventDate, day);
      }

      if (matches) {
        let color = 'bg-zinc-700/50 text-zinc-300 border-zinc-600/50';
        if (event.type === 'income') color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        if (event.type === 'bill') color = 'bg-red-500/20 text-red-400 border-red-500/30';
        if (event.type === 'other') color = 'bg-purple-500/20 text-purple-400 border-purple-500/30';

        events.push({
          id: event.id,
          title: event.title,
          amount: event.amount,
          type: event.type,
          color,
          isCustom: true
        });
      }
    });
    
    return events;
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleSaveEvent = () => {
    if (!newTitle || !newAmount || !newDate) return;

    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      title: newTitle,
      amount: parseFloat(newAmount),
      date: new Date(newDate).toISOString(),
      type: newType,
      isRecurring: newIsRecurring
    };

    addCalendarEvent(event);
    setIsAddOpen(false);
    
    // Reset form
    setNewTitle("");
    setNewAmount("");
    setNewType("other");
    setNewIsRecurring(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Calendar</h1>
          <p className="text-zinc-400">Visualize your cash flow and upcoming commitments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Calendar Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input 
                    id="title" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="e.g. Paycheck, Rent, Bonus"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={newAmount} 
                    onChange={(e) => setNewAmount(e.target.value)} 
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={newDate} 
                    onChange={(e) => setNewDate(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newType} 
                    onChange={(val) => setNewType(val as any)}
                  >
                    <option value="bill">Bill</option>
                    <option value="income">Income</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="recurring" 
                    checked={newIsRecurring}
                    onChange={(e) => setNewIsRecurring(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <Label htmlFor="recurring">Repeat Monthly</Label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEvent} className="bg-cyan-500 text-black hover:bg-cyan-400">Save Event</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 p-1">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[120px] text-center font-semibold text-white">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-xl border border-white/10 bg-zinc-800 overflow-hidden shadow-2xl shadow-black/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-zinc-900/90 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {day}
          </div>
        ))}
        
        {/* Padding for start of month */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[120px] bg-zinc-950/50" />
        ))}

        {days.map(day => {
          const events = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "group relative flex min-h-[120px] flex-col gap-1 p-2 transition-colors hover:bg-zinc-900/80",
                isToday ? "bg-zinc-900 ring-1 ring-inset ring-cyan-500/50" : "bg-zinc-950"
              )}
            >
              <span className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                isToday ? "bg-cyan-500 text-black" : "text-zinc-400 group-hover:text-white"
              )}>
                {format(day, "d")}
              </span>

              <div className="flex flex-col gap-1 mt-1">
                <AnimatePresence>
                  {events.map((event, i) => (
                    <motion.div
                      key={`${event.id}-${i}`}
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={cn(
                        "group/event relative flex items-center justify-between rounded px-1.5 py-1 text-[10px] border cursor-pointer",
                        event.color
                      )}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">{event.title}</span>
                        <span className="opacity-80">₹{event.amount}</span>
                      </div>
                      
                      {event.isCustom && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCalendarEvent(event.id);
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/event:opacity-100 p-1 hover:bg-black/20 rounded transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Income</CardTitle>
            <CalendarIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₹{days.reduce((acc, day) => acc + getEventsForDay(day).filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0), 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-zinc-500">expected this month</p>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses</CardTitle>
            <CalendarIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₹{days.reduce((acc, day) => acc + getEventsForDay(day).filter(e => e.type === 'bill' || e.type === 'sub').reduce((sum, e) => sum + e.amount, 0), 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-zinc-500">due this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
