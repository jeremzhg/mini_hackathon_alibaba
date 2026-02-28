/**
 * Shared Transaction type and dummy data used by both
 * the Dashboard (Recent Transactions) and the Transaction page.
 */

export interface Transaction {
    id: string;
    timestamp: string;
    time: string;
    type: "outbound" | "inbound";
    description: string;
    agent: string;
    agentColor: string;
    amount: string;
    currency: string;
    status: "Completed" | "Pending" | "Failed";
}

export const TRANSACTIONS: Transaction[] = [
    {
        id: "TXN-001",
        timestamp: "2023-10-27",
        time: "10:45:22",
        type: "outbound",
        description: "AWS Infrastructure Payment",
        agent: "Agent-Alpha",
        agentColor: "bg-[#60a5fa]",
        amount: "-$2,450.00",
        currency: "USD",
        status: "Completed",
    },
    {
        id: "TXN-002",
        timestamp: "2023-10-27",
        time: "10:30:15",
        type: "inbound",
        description: "Client API Revenue",
        agent: "Agent-Beta",
        agentColor: "bg-purple-400",
        amount: "+$8,920.50",
        currency: "USD",
        status: "Completed",
    },
    {
        id: "TXN-003",
        timestamp: "2023-10-27",
        time: "09:15:41",
        type: "outbound",
        description: "Alibaba Cloud — Data Processing",
        agent: "Agent-Alpha",
        agentColor: "bg-[#60a5fa]",
        amount: "-$1,100.00",
        currency: "USD",
        status: "Completed",
    },
    {
        id: "TXN-004",
        timestamp: "2023-10-27",
        time: "08:50:33",
        type: "outbound",
        description: "Suspicious Transfer — BLOCKED",
        agent: "Agent-Gamma",
        agentColor: "bg-yellow-400",
        amount: "-$15,000.00",
        currency: "USD",
        status: "Failed",
    },
    {
        id: "TXN-005",
        timestamp: "2023-10-26",
        time: "22:12:09",
        type: "inbound",
        description: "Subscription Revenue",
        agent: "Agent-Alpha",
        agentColor: "bg-[#60a5fa]",
        amount: "+$3,200.00",
        currency: "USD",
        status: "Completed",
    },
    {
        id: "TXN-006",
        timestamp: "2023-10-26",
        time: "18:45:00",
        type: "outbound",
        description: "PayLabs Gateway Fee",
        agent: "Agent-Beta",
        agentColor: "bg-purple-400",
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
        agent: "Agent-Alpha",
        agentColor: "bg-[#60a5fa]",
        amount: "-$540.00",
        currency: "USD",
        status: "Completed",
    },
    {
        id: "TXN-008",
        timestamp: "2023-10-26",
        time: "11:05:30",
        type: "inbound",
        description: "Enterprise License Payment",
        agent: "Agent-Gamma",
        agentColor: "bg-yellow-400",
        amount: "+$24,500.00",
        currency: "USD",
        status: "Completed",
    },
];
