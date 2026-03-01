/**
 * Shared Transaction type and dummy data used by both
 * the Dashboard (Recent Transactions) and the Transaction page.
 */

export interface Transaction {
    id: string;
    timestamp: string;
    time: string;
    type: "outbound";
    description: string;
    category: string;
    categoryColor: string;
    amount: string;
    currency: string;
    status: "Allowed" | "Pending" | "Blocked";
}

export const TRANSACTIONS: Transaction[] = [
    {
        id: "TXN-001",
        timestamp: "2023-10-27",
        time: "10:45:22",
        type: "outbound",
        description: "AWS Infrastructure Payment",
        category: "Cloud Services",
        categoryColor: "bg-[#60a5fa]",
        amount: "-$2,450.00",
        currency: "USD",
        status: "Allowed",
    },
    {
        id: "TXN-002",
        timestamp: "2023-10-27",
        time: "10:30:15",
        type: "outbound",
        description: "Figma Team License",
        category: "Software Licenses",
        categoryColor: "bg-purple-400",
        amount: "-$45.00",
        currency: "USD",
        status: "Allowed",
    },
    {
        id: "TXN-003",
        timestamp: "2023-10-27",
        time: "09:15:41",
        type: "outbound",
        description: "Alibaba Cloud — Data Processing",
        category: "Cloud Services",
        categoryColor: "bg-[#60a5fa]",
        amount: "-$1,100.00",
        currency: "USD",
        status: "Allowed",
    },
    {
        id: "TXN-004",
        timestamp: "2023-10-27",
        time: "08:50:33",
        type: "outbound",
        description: "Suspicious Transfer — BLOCKED",
        category: "Uncategorized",
        categoryColor: "bg-yellow-400",
        amount: "-$15,000.00",
        currency: "USD",
        status: "Blocked",
    },
    {
        id: "TXN-005",
        timestamp: "2023-10-26",
        time: "22:12:09",
        type: "outbound",
        description: "Google Workspace Subscription",
        category: "Software Licenses",
        categoryColor: "bg-purple-400",
        amount: "-$299.00",
        currency: "USD",
        status: "Allowed",
    },
    {
        id: "TXN-006",
        timestamp: "2023-10-26",
        time: "18:45:00",
        type: "outbound",
        description: "PayLabs Gateway Fee",
        category: "Payment Fees",
        categoryColor: "bg-emerald-400",
        amount: "-$89.99",
        currency: "USD",
        status: "Pending",
    },
    {
        id: "TXN-007",
        timestamp: "2023-10-26",
        time: "14:22:17",
        type: "outbound",
        description: "Database Scaling — MongoDB Atlas",
        category: "Cloud Services",
        categoryColor: "bg-[#60a5fa]",
        amount: "-$540.00",
        currency: "USD",
        status: "Allowed",
    },
    {
        id: "TXN-008",
        timestamp: "2023-10-26",
        time: "11:05:30",
        type: "outbound",
        description: "Unauthorized Vendor — BLOCKED",
        category: "Uncategorized",
        categoryColor: "bg-yellow-400",
        amount: "-$8,750.00",
        currency: "USD",
        status: "Blocked",
    },
];
