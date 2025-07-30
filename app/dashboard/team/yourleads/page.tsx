// app/page.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// --- Data from your image ---

const airtelClients = [
  { 
    sn: 1, 
    clientName: "Kamakhya", 
    ownerName: "PRIYA VERMA" 
  },
  {
    sn: 2,
    clientName: "Devendra Kumar Rathore",
    ownerName: "PRIYA VERMA, Shweta vedi, Faishal",
  },
];

const angelOneClients = [
  { sn: 1, clientName: "Kavita", ownerName: "PRIYA VERMA" },
  { sn: 2, clientName: "Raj Vishwakarma", ownerName: "PRIYA VERMA" },
  { sn: 3, clientName: "Sunita yadav", ownerName: "PRIYA VERMA" },
  { sn: 4, clientName: "Noor Banu J", ownerName: "PRIYA VERMA" },
  { sn: 5, clientName: "Ananya", ownerName: "PRIYA VERMA" },
  { sn: 6, clientName: "Vikas kumar", ownerName: "PRIYA VERMA" },
];


export default function ClientDashboard() {
  return (
    <main className="bg-whtie min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* --- First Table: Airtel-Payment-Bank --- */}
        <Card>
          {/* UPDATED: CardHeader now uses flexbox to show titles on both sides */}
          <CardHeader className="bg-slate-50 rounded-t-lg flex justify-between items-center p-4">
            <CardTitle className="text-xl font-semibold text-black">
              Airtel-Payment-Bank (2)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">S.N</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {airtelClients.map((client) => (
                  <TableRow key={client.sn}>
                    <TableCell className="font-medium">{client.sn}</TableCell>
                    <TableCell>{client.clientName}</TableCell>
                    <TableCell>{client.ownerName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* --- Second Table: Angel-One-Non --- */}
        <Card>
          {/* UPDATED: CardHeader now uses flexbox to show titles on both sides */}
          <CardHeader className="bg-slate-50 rounded-t-lg flex justify-between items-center p-4">
            <CardTitle className="text-xl font-semibold text-black">
              Angel-One-Non (35)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">S.N</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {angelOneClients.map((client) => (
                  <TableRow key={client.sn}>
                    <TableCell className="font-medium">{client.sn}</TableCell>
                    <TableCell>{client.clientName}</TableCell>
                    <TableCell>{client.ownerName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}