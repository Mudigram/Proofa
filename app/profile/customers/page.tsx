/**
 * app/profile/customers/page.tsx
 *
 * Customer Address Book & Product Catalog management UI.
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Package, Plus, Trash2, Phone, Mail, Search, Check } from "lucide-react";
import { Customer, CatalogItem } from "@/lib/types";
import {
    getSavedCustomers,
    saveCustomer,
    deleteCustomer,
    getSavedCatalogItems,
    saveCatalogItem,
    deleteCatalogItem,
} from "@/lib/CustomerCatalogUtils";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

export default function CustomersPage() {
    const [tab, setTab] = useState<"customers" | "catalog">("customers");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { showToast } = useToast();

    // Modal state for adding new customer
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustName, setNewCustName] = useState("");
    const [newCustPhone, setNewCustPhone] = useState("");
    const [newCustEmail, setNewCustEmail] = useState("");

    // Modal state for adding new catalog item
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");

    useEffect(() => {
        setCustomers(getSavedCustomers());
        setCatalog(getSavedCatalogItems());
    }, []);

    const handleCreateCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustName.trim()) {
            showToast("Customer name is required", "error");
            return;
        }
        const created = saveCustomer({
            name: newCustName.trim(),
            phone: newCustPhone.trim() || null,
            email: newCustEmail.trim() || null,
        });
        setCustomers(getSavedCustomers());
        setNewCustName("");
        setNewCustPhone("");
        setNewCustEmail("");
        setIsAddCustomerOpen(false);
        showToast(`Saved customer "${created.name}"!`, "success");
    };

    const handleDeleteCustomer = (id: string, name: string) => {
        deleteCustomer(id);
        setCustomers(getSavedCustomers());
        showToast(`Deleted "${name}"`, "info");
    };

    const handleCreateCatalogItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || !newItemPrice) {
            showToast("Item name and price are required", "error");
            return;
        }
        const created = saveCatalogItem({
            name: newItemName.trim(),
            price: parseFloat(newItemPrice) || 0,
        });
        setCatalog(getSavedCatalogItems());
        setNewItemName("");
        setNewItemPrice("");
        setIsAddItemOpen(false);
        showToast(`Saved catalog item "${created.name}"!`, "success");
    };

    const handleDeleteCatalogItem = (id: string, name: string) => {
        deleteCatalogItem(id);
        setCatalog(getSavedCatalogItems());
        showToast(`Deleted "${name}"`, "info");
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone && c.phone.includes(searchQuery))
    );

    const filteredCatalog = catalog.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="app-container min-h-screen pb-24 pt-6 max-w-md mx-auto px-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/profile"
                    className="w-9 h-9 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center text-surface-600 dark:text-surface-300"
                >
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-surface-900 dark:text-surface-50">
                        Address Book & Catalog
                    </h1>
                    <p className="text-xs text-surface-500 font-medium">Manage your saved clients and items</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-surface-100 dark:bg-surface-800 p-1.5 rounded-2xl mb-6">
                <button
                    onClick={() => setTab("customers")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        tab === "customers"
                            ? "bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm"
                            : "text-surface-500"
                    }`}
                >
                    <Users size={14} />
                    Customers ({customers.length})
                </button>
                <button
                    onClick={() => setTab("catalog")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        tab === "catalog"
                            ? "bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm"
                            : "text-surface-500"
                    }`}
                >
                    <Package size={14} />
                    Catalog ({catalog.length})
                </button>
            </div>

            {/* Search + Action Bar */}
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-3.5 text-surface-400" />
                    <input
                        type="text"
                        placeholder={`Search ${tab}...`}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <button
                    onClick={() => tab === "customers" ? setIsAddCustomerOpen(true) : setIsAddItemOpen(true)}
                    className="px-4 py-2.5 bg-primary-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
                >
                    <Plus size={16} />
                    Add New
                </button>
            </div>

            {/* Customers View */}
            {tab === "customers" && (
                <div className="flex flex-col gap-3">
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200/80 dark:border-surface-800 p-6">
                            <Users size={32} className="mx-auto text-surface-300 mb-3" />
                            <p className="text-sm font-bold text-surface-700 dark:text-surface-300">No saved customers yet</p>
                            <p className="text-xs text-surface-400 mt-1">
                                Customers are saved automatically when you issue receipts or invoices.
                            </p>
                        </div>
                    ) : (
                        filteredCustomers.map(c => (
                            <div
                                key={c.id}
                                className="bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-2xl p-4 flex items-center justify-between"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <h4 className="text-sm font-extrabold text-surface-900 dark:text-surface-50">{c.name}</h4>
                                    {c.phone && (
                                        <p className="text-xs text-surface-500 font-medium flex items-center gap-1">
                                            <Phone size={12} className="text-surface-400" /> {c.phone}
                                        </p>
                                    )}
                                    {c.email && (
                                        <p className="text-xs text-surface-400 font-medium flex items-center gap-1">
                                            <Mail size={12} /> {c.email}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteCustomer(c.id, c.name)}
                                    className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Catalog View */}
            {tab === "catalog" && (
                <div className="flex flex-col gap-3">
                    {filteredCatalog.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200/80 dark:border-surface-800 p-6">
                            <Package size={32} className="mx-auto text-surface-300 mb-3" />
                            <p className="text-sm font-bold text-surface-700 dark:text-surface-300">No catalog items yet</p>
                            <p className="text-xs text-surface-400 mt-1">
                                Line items you type on receipts are automatically saved here for quick reuse.
                            </p>
                        </div>
                    ) : (
                        filteredCatalog.map(i => (
                            <div
                                key={i.id}
                                className="bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-2xl p-4 flex items-center justify-between"
                            >
                                <div>
                                    <h4 className="text-sm font-extrabold text-surface-900 dark:text-surface-50">{i.name}</h4>
                                    <p className="text-xs font-black text-primary-600 dark:text-primary-400 mt-0.5">
                                        ₦{i.price.toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteCatalogItem(i.id, i.name)}
                                    className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add Customer Modal */}
            <Modal
                isOpen={isAddCustomerOpen}
                onClose={() => setIsAddCustomerOpen(false)}
                title="Add New Customer"
            >
                <form onSubmit={handleCreateCustomer} className="flex flex-col gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-surface-500 tracking-wider">Customer Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Chinedu Okafor"
                            value={newCustName}
                            onChange={e => setNewCustName(e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-xs font-medium mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-surface-500 tracking-wider">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="e.g. 08012345678"
                            value={newCustPhone}
                            onChange={e => setNewCustPhone(e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-xs font-medium mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-surface-500 tracking-wider">Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. client@gmail.com"
                            value={newCustEmail}
                            onChange={e => setNewCustEmail(e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-xs font-medium mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-primary-500 text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all mt-2"
                    >
                        Save Customer
                    </button>
                </form>
            </Modal>

            {/* Add Catalog Item Modal */}
            <Modal
                isOpen={isAddItemOpen}
                onClose={() => setIsAddItemOpen(false)}
                title="Add Catalog Item"
            >
                <form onSubmit={handleCreateCatalogItem} className="flex flex-col gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-surface-500 tracking-wider">Item / Service Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Ankara Fabric (5 Yards)"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-xs font-medium mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-surface-500 tracking-wider">Price (₦) *</label>
                        <input
                            type="number"
                            required
                            placeholder="e.g. 15000"
                            value={newItemPrice}
                            onChange={e => setNewItemPrice(e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-xs font-medium mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-primary-500 text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all mt-2"
                    >
                        Save Item
                    </button>
                </form>
            </Modal>

        </main>
    );
}
