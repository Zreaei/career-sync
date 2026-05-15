"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import TopBar from "@/components/layout/TopBar";

const notifications = [
  { id: 1, title: "Interview Scheduled", body: "Your interview with TechNova Partners for the Junior Analyst role has been confirmed for tomorrow at 2:00 PM.", time: "10 min ago", icon: "work", read: false, color: "text-primary" },
  { id: 2, title: "Thesis Approved", body: "Dr. Aris Thorne has approved your final thesis draft. You can now proceed to formatting and submission.", time: "2 hours ago", icon: "school", read: false, color: "text-tertiary" },
  { id: 3, title: "Career Fair Tomorrow", body: "Don't forget the Annual Spring Career Fair starts tomorrow at 9:00 AM in the Main Hall. Over 50 companies attending.", time: "Yesterday", icon: "event", read: false, color: "text-primary" },
  { id: 4, title: "New Connection Request", body: "Sarah Jenkins (Alumni, Class of '20) wants to connect with you.", time: "2 days ago", icon: "group_add", read: true, color: "text-on-surface-variant" },
  { id: 5, title: "Resume Review Completed", body: "The career center has added notes to your uploaded resume. Review the feedback to improve your profile.", time: "Last Week", icon: "description", read: true, color: "text-on-surface-variant" },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [notifs, setNotifs] = useState(notifications);

  const displayed = tab === "all" ? notifs : notifs.filter((n) => !n.read);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));

  return (
    <>
      <TopBar />
      <div className="max-w-3xl mx-auto p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-on-background mb-2">Notifications</h1>
          <p className="font-body text-on-surface-variant">Stay updated with your academic and career milestones.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-variant">
            <div className="flex gap-4">
              <button onClick={() => setTab("all")} className={`font-label text-sm font-semibold pb-2 px-1 transition-colors ${tab === "all" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`}>All</button>
              <button onClick={() => setTab("unread")} className={`font-label text-sm font-medium pb-2 px-1 transition-colors ${tab === "unread" ? "text-primary border-b-2 border-primary font-semibold" : "text-on-surface-variant hover:text-primary"}`}>Unread ({unreadCount})</button>
            </div>
            <button onClick={markAllRead} className="font-label text-xs text-primary hover:underline">Mark all as read</button>
          </div>

          <div className="space-y-4">
            {displayed.map((n) => (
              <div key={n.id} className={`relative group p-4 rounded-xl flex gap-4 cursor-pointer transition-colors ${!n.read ? "bg-primary-fixed/30 hover:bg-primary-fixed/50" : "hover:bg-surface-container-low"}`}>
                {!n.read && <span className="absolute top-6 left-2 w-2 h-2 bg-primary rounded-full" />}
                <div className={`flex-shrink-0 w-12 h-12 bg-surface-container rounded-full flex items-center justify-center ${n.color} ${!n.read ? "ml-2" : ""}`}>
                  <Icon name={n.icon} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-headline text-lg ${!n.read ? "font-bold text-on-background" : "font-semibold text-on-surface"}`}>{n.title}</h3>
                    <span className="font-label text-xs text-on-surface-variant whitespace-nowrap ml-4">{n.time}</span>
                  </div>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{n.body}</p>
                </div>
              </div>
            ))}
          </div>

          {displayed.length === 0 && (
            <div className="text-center py-12">
              <Icon name="notifications_none" className="text-outline mx-auto mb-3" size={40} />
              <p className="font-body text-on-surface-variant">No unread notifications</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-surface-variant text-center">
            <button className="font-label text-sm text-primary font-semibold hover:text-primary-container transition-colors">Load More</button>
          </div>
        </div>
      </div>
    </>
  );
}
