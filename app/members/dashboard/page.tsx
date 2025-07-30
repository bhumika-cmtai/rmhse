"use client"
import { useState, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, UserPlus, UserSearch, User, Wallet, FileSearch, Landmark, ShieldCheck, KeyRound, Phone } from "lucide-react"
import { toast } from "sonner"

// Helper component for consistent key-value display in the profile
const InfoRow = ({ label, value }: { label: string; value: string | ReactNode }) => (
  <div className="flex justify-between items-center text-sm py-2">
    <span className="text-slate-400">{label}</span>
    <span className="font-medium text-slate-100">{value}</span>
  </div>
);

export default function UserDashboard() {
  const [selectedBroker, setSelectedBroker] = useState("Angel-One")
  const [clientCode, setClientCode] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [paymentMobile, setPaymentMobile] = useState("8708718542")
  const [transactionIdOffice, setTransactionIdOffice] = useState("")
  const [transactionIdOther, setTransactionIdOther] = useState("")
  const [isBankAccessGranted, setIsBankAccessGranted] = useState(false);
  const [leaderCode, setLeaderCode] = useState("");
  const [authPhoneNumber, setAuthPhoneNumber] = useState("");
  
  // State for the actual bank details form
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [panNumber, setPanNumber] = useState("");
  // ------------------------------------

  // Static data
  const bankDetails = [
    { mobileN: "8708718542", accountNumber: "41610750364", ifscCode: "SBIN0016253", upiId: "8708718542@ptsbI", panNumber: "CBYPV8332H", tlName: "N/A" },
  ]
  const paytmMoneyData = [
    { sn: 1, clientName: "Phulmati kumari", ownerName: "PRIYA VERMA" },
    { sn: 2, clientName: "shivani pandey", ownerName: "PRIYA VERMA" },
    { sn: 3, clientName: "Neeraj verma", ownerName: "PRIYA VERMA,PRIYA VERMA,Nainika chaurasia" },
  ]

  const handleBankAccessVerification = (e: React.FormEvent) => {
    e.preventDefault();
    // Using sample data for verification as requested
    const SAMPLE_LEADER_CODE = "LEADER123";
    const SAMPLE_PHONE_NUMBER = "9876543210";

    if (leaderCode === SAMPLE_LEADER_CODE && authPhoneNumber === SAMPLE_PHONE_NUMBER) {
      toast.success("Verification successful! You can now manage your bank account.");
      setIsBankAccessGranted(true);
    } else {
      toast.error("Invalid Leader Code or Phone Number. Please try again.");
    }
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, you would dispatch an action to save the data here
      toast.success("Bank details saved successfully!");
      // Optionally, you could lock the form again after saving
      // setIsBankAccessGranted(false);
  }

  return (
    <div className="bg-slate-950 text-slate-200 font-sans min-h-full">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">User Dashboard</h1>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
            A centralized hub to manage client data, track finances, and handle leads efficiently.
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. Confirm Identity Card */}
          <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white"><UserSearch className="text-blue-500"/>Confirm Client Identity</CardTitle>
              <CardDescription>Fetch client profile by providing their registered details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full">
                    <label className="text-xs font-medium text-slate-400">Portal</label>
                    <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 mt-1 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-white"><SelectItem value="Angel-One">Angel-One</SelectItem><SelectItem value="M-Stock">M-Stock</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="w-full">
                    <label className="text-xs font-medium text-slate-400">Mobile Number</label>
                    <Input placeholder="e.g. 9876543210" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="bg-slate-800 border-slate-700 mt-1"/>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6 w-full sm:w-auto flex-shrink-0">Confirm</Button>
              </div>
            </CardContent>
          </Card>

          {/* 2. User Profile Card */}
          <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white"><User className="text-blue-500"/>Client Profile</CardTitle>
              <CardDescription>Overview of the verified client's information and status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Left Side: Avatar & Name */}
                  {/* <div className="flex flex-col items-center text-center space-y-4 flex-shrink-0">
                      <Avatar className="w-28 h-28 border-4 border-slate-700">
                          <AvatarFallback className="bg-slate-800 text-white text-3xl font-bold">DR</AvatarFallback>
                      </Avatar>
                      <div>
                          <h2 className="text-2xl font-bold text-white">DAYA RAM</h2>
                          <p className="text-slate-400">M-Stock</p>
                      </div>
                      <div className="flex gap-3">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-500"><UserPlus className="w-4 h-4 mr-2" />Follow</Button>
                          <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-800"><MessageCircle className="w-4 h-4 mr-2" />Message</Button>
                      </div>
                  </div> */}
                  {/* Right Side: Details & Update Form */}
                  <div className="w-full space-y-4 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                    {/* <InfoRow label="Client ID" value="MA4976583" /> */}
                    <InfoRow label="Full Name" value="DAYA RAM" />
                    <InfoRow label="Phone No." value="9873150916" />
                    <InfoRow label="eKYC Stage" value={<span className="font-semibold text-green-400">Complete</span>} />
                    <InfoRow label="Trade Status" value="Yes (S)" />
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-2">
                        <Input placeholder="Owner Name" className="bg-slate-800 border-slate-700"/>
                        <Input placeholder="Owner Mobile" className="bg-slate-800 border-slate-700"/>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500">Update</Button>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Get your details */}
          <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white"><Wallet className="text-blue-500"/>Get Your Details</CardTitle>
                <CardDescription>Check total income and view details from various payment sources.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Input value={paymentMobile} onChange={(e) => setPaymentMobile(e.target.value)} className="bg-slate-800 border-slate-700 max-w-xs text-gray-100"/>
                      <Button className="bg-blue-600 hover:bg-blue-500 w-full sm:w-auto">Check Payment</Button>
                  </div>
                  <div className="text-center bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm tracking-widest uppercase">Total Income</p>
                      <p className="text-4xl font-bold text-green-400 mt-1">₹ 23,296.67</p>
                  </div>
                  {/* Bank/Payment Tables */}
                  <div className="space-y-6">
                      <div>
                          <h4 className="font-semibold text-slate-100 mb-3 text-2xl text-center">  Bank Details</h4>
                          <div className="rounded-lg border border-slate-800 overflow-hidden">
                              <Table>
                                  <TableHeader className="bg-slate-800"><TableRow className="hover:bg-slate-800 border-b-slate-700"><TableHead className="text-white">Account Number</TableHead><TableHead className="text-white">IFSC</TableHead><TableHead className="text-white">UPI ID</TableHead><TableHead className="text-white">PAN</TableHead></TableRow></TableHeader>
                                  <TableBody>{bankDetails.map((detail, index) => (<TableRow key={index} className="border-slate-800 text-slate-300"><TableCell>{detail.accountNumber}</TableCell><TableCell>{detail.ifscCode}</TableCell><TableCell>{detail.upiId}</TableCell><TableCell>{detail.panNumber}</TableCell></TableRow>))}</TableBody>
                              </Table>
                          </div>
                      </div>
                       <div>
                          <h4 className="font-semibold text-slate-100 mb-3 text-lg text-center">Paytm-Money (3)</h4>
                           <div className="rounded-lg border border-slate-800 overflow-hidden">
                              <Table>
                                  <TableHeader className="bg-slate-800"><TableRow className="hover:bg-slate-800 border-b-slate-700"><TableHead className="text-white">S.N</TableHead><TableHead className="text-white">Client Name</TableHead><TableHead className="text-white">Owner Name</TableHead></TableRow></TableHeader>
                                  <TableBody>{paytmMoneyData.map((item) => (<TableRow key={item.sn} className="border-slate-800 text-slate-300"><TableCell>{item.sn}</TableCell><TableCell>{item.clientName}</TableCell><TableCell className="text-xs">{item.ownerName}</TableCell></TableRow>))}</TableBody>
                              </Table>
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>
          
          
          {/* 5. Manage Bank Account Card */}
          <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <Landmark className="text-blue-500" />
                Manage Bank Account
              </CardTitle>
              <CardDescription>
                {isBankAccessGranted
                  ? "Add or update your bank account information securely."
                  : "Please verify your identity to access bank account settings."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isBankAccessGranted ? (
                // --- VIEW 1: Verification Gate ---
                <form onSubmit={handleBankAccessVerification} className="space-y-4">
                  <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                          placeholder="Leader Code"
                          value={leaderCode}
                          onChange={(e) => setLeaderCode(e.target.value)}
                          className="bg-slate-800 border-slate-700 pl-10 text-white"
                          required
                      />
                  </div>
                  <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                          placeholder="Registered Phone Number"
                          type="tel"
                          value={authPhoneNumber}
                          onChange={(e) => setAuthPhoneNumber(e.target.value)}
                          className="bg-slate-800 border-slate-700 pl-10 text-white"
                          required
                      />
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 w-full mt-2">
                    Verify & Proceed
                  </Button>
                </form>
              ) : (
                // --- VIEW 2: Bank Details Form (shown after verification) ---
                <form onSubmit={handleSaveBankDetails} className="space-y-4">
                  <Input 
                    placeholder="Account Holder Name" 
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="bg-slate-800 border-slate-700" 
                    required
                  />
                  <Input 
                    placeholder="Account Number" 
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="bg-slate-800 border-slate-700" 
                    required
                  />
                  <Input 
                    placeholder="IFSC Code" 
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="bg-slate-800 border-slate-700" 
                    required
                  />
                  <Input 
                    placeholder="UPI ID (Optional)" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="bg-slate-800 border-slate-700" 
                  />
                  <Input 
                    placeholder="PAN Number" 
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    className="bg-slate-800 border-slate-700" 
                    required
                  />
                  <Button type="submit" className="bg-green-600 hover:bg-green-500 w-full mt-2">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Save Securely
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}