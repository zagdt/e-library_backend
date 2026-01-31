"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
    Users,
    Search,
    MoreHorizontal,
    Shield,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import type { User, UserRole } from "@/types/api";

export default function AdminUsersPage() {
    const router = useRouter();
    const { isAdmin, user: currentUser } = useRole();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState<UserRole>("STUDENT");

    const { data, isLoading } = useAdminUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
    });
    const { mutate: updateRole, isPending: updatingRole } = useUpdateUserRole();
    const { mutate: deleteUser, isPending: deletingUser } = useDeleteUser();

    const users = data?.data || [];
    const pagination = data?.pagination;

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }

    const handleUpdateRole = () => {
        if (selectedUser) {
            updateRole(
                { id: selectedUser.id, data: { role: newRole } },
                {
                    onSuccess: () => {
                        setRoleDialogOpen(false);
                        setSelectedUser(null);
                    },
                }
            );
        }
    };

    const handleDeleteUser = () => {
        if (selectedUser) {
            deleteUser(selectedUser.id, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSelectedUser(null);
                },
            });
        }
    };

    const canDeleteUser = (user: User) => {
        return user.id !== currentUser?.id && user.role !== "ADMIN";
    };

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case "ADMIN":
                return "destructive";
            case "STAFF":
                return "default";
            default:
                return "secondary";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <p className="text-muted-foreground">
                    Manage users, roles, and permissions
                </p>
            </div>
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={roleFilter}
                            onValueChange={(value) => {
                                setRoleFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="STAFF">Staff</SelectItem>
                                <SelectItem value="STUDENT">Student</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            {isLoading ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-48 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : users.length > 0 ? (
                <>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {users.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                                    >
                                        <Avatar>
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>
                                                {getInitials(`${user.firstName} ${user.lastName}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                {!user.isVerified && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Unverified
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="hidden sm:block text-sm text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </div>
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {user.role}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewRole(user.role);
                                                        setRoleDialogOpen(true);
                                                    }}
                                                >
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Change Role
                                                </DropdownMenuItem>
                                                {canDeleteUser(user) && (
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrev}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-4">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNext}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No users found</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                            {search || roleFilter !== "all"
                                ? "Try adjusting your filters."
                                : "There are no users yet."}
                        </p>
                    </CardContent>
                </Card>
            )}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedUser?.firstName} {selectedUser?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="STAFF">Staff</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRole} disabled={updatingRole}>
                            {updatingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser} disabled={deletingUser}>
                            {deletingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
