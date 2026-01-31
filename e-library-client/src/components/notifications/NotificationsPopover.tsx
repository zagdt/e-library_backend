import { useState } from "react";
import {
    Bell,
    Check,
    Trash2,
    BookOpen,
    AlertCircle,
    Info,
    CheckCircle2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    useNotifications,
    useUnreadCount,
    useMarkAsRead,
    useMarkAllAsRead,
    useDeleteNotification
} from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NotificationsPopover() {
    const [open, setOpen] = useState(false);
    const { data: notificationsData, isLoading } = useNotifications({ limit: 20 });
    const { data: unreadCountData } = useUnreadCount();

    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const deleteNotification = useDeleteNotification();

    const unreadCount = unreadCountData?.data?.unreadCount || 0;
    const notifications = notificationsData?.data || [];

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        markAsRead.mutate(id);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteNotification.mutate(id);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "REQUEST_UPDATE":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "RESOURCE_ADDED":
                return <BookOpen className="h-4 w-4 text-blue-500" />;
            case "ACCOUNT":
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 pb-2">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {unreadCount} new
                        </Badge>
                    )}
                </div>
                <div className="px-4 pb-2 flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => markAllAsRead.mutate()}
                        disabled={unreadCount === 0 || markAllAsRead.isPending}
                    >
                        Mark all as read
                    </Button>
                </div>
                <Separator />
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            <Bell className="mx-auto h-8 w-8 mb-3 opacity-20" />
                            No notifications yet
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0",
                                        !notification.read && "bg-muted/20 border-l-2 border-l-primary pl-[14px]"
                                    )}
                                    onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            {getIcon(notification.type)}
                                            <span className={cn(notification.read && "text-muted-foreground")}>
                                                {notification.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-3 w-3" />
                                                    <span className="sr-only">Mark as read</span>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive hover:text-destructive"
                                                onClick={(e) => handleDelete(notification.id, e)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground/50 mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
