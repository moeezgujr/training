import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import {
  DollarSign,
  CreditCard,
  RefreshCw,
  CheckCircle,
  X,
  Search,
  Download,
  Eye,
  Plus,
  Wallet,
  Building,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";

export default function PaymentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [accountDialog, setAccountDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [accountData, setAccountData] = useState({
    provider: '',
    accountName: '',
    accountNumber: '',
    merchantId: '',
    apiKey: '',
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/admin/payment-transactions'],
  });

  const { data: paymentAccounts } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
  });

  const { data: refunds } = useQuery({
    queryKey: ['/api/admin/refunds'],
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ id, action, data }: { id: string; action: string; data: any }) => {
      const response = await fetch(`/api/admin/payment-transactions/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      if (!response.ok) throw new Error('Failed to verify payment');
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      toast({ title: "Payment Verified", description: "Payment has been successfully processed." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-transactions'] });
    },
    onError: () => {
      toast({ title: "Verification Failed", description: "Failed to verify payment. Please try again.", variant: "destructive" });
    },
  });

  const saveAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save payment account');
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      toast({ title: "Payment Account Saved", description: "Payment account configuration has been saved." });
      setAccountDialog(false);
      setAccountData({ provider: '', accountName: '', accountNumber: '', merchantId: '', apiKey: '', isActive: true });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
    },
    onError: () => {
      toast({ title: "Save Failed", description: "Failed to save payment account. Please try again.", variant: "destructive" });
    },
  });

  const handleVerifyPayment = (transaction: any, action: 'approve' | 'reject') => {
    verifyPaymentMutation.mutate({
      id: transaction.id,
      action,
      data: {
        notes: action === 'approve' ? 'Payment verified and approved' : 'Payment rejected after review',
      },
    });
  };

  const handleSaveAccount = () => {
    if (!accountData.provider || !accountData.accountName) return;
    saveAccountMutation.mutate(accountData);
  };

  const filteredTransactions = (transactions as any[])?.filter((transaction: any) => {
    const matchesSearch = !searchQuery ||
      transaction.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || transaction.paymentMethod === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  }) || [];

  const stats = {
    totalRevenue: (transactions as any[])?.filter((t: any) => t.status === 'completed')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0) || 0,
    totalTransactions: (transactions as any[])?.length || 0,
    pendingPayments: (transactions as any[])?.filter((t: any) => t.status === 'pending').length || 0,
    successfulPayments: (transactions as any[])?.filter((t: any) => t.status === 'completed').length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-transparent min-h-screen">
        <AdminHeader title="Payment Management" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <AdminHeader title="Payment Management" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", val: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-400" },
          { label: "Total Transactions", val: stats.totalTransactions, icon: CreditCard, color: "text-blue-400" },
          { label: "Pending Payments", val: stats.pendingPayments, icon: RefreshCw, color: "text-yellow-400" },
          { label: "Successful Payments", val: stats.successfulPayments, icon: CheckCircle, color: "text-green-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20 shadow-none border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.val}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-sm border border-white/10 p-1">
          <TabsTrigger value="transactions" className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white">Transactions</TabsTrigger>
          <TabsTrigger value="accounts" className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white">Payment Accounts</TabsTrigger>
          <TabsTrigger value="refunds" className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white">Refunds</TabsTrigger>
          <TabsTrigger value="analytics" className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-none border">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white border-white/20">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white border-white/20">
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                      <SelectItem value="jazzcash">JazzCash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/10 shadow-none border">
            <CardHeader>
              <CardTitle className="text-white">Payment Transactions</CardTitle>
              <CardDescription className="text-gray-300">Manage and verify payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-300">Transaction ID</TableHead>
                    <TableHead className="text-gray-300">Student</TableHead>
                    <TableHead className="text-gray-300">Course</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Method</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-mono text-sm text-white">{transaction.transactionId || '—'}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{transaction.user?.name || '—'}</p>
                          <p className="text-sm text-gray-400">{transaction.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{transaction.course?.title || '—'}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-white">${transaction.amount}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/20 text-white bg-white/5">{transaction.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          transaction.status === 'completed' ? 'bg-green-500 text-white' :
                          transaction.status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                        }>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {transaction.createdAt ? format(new Date(transaction.createdAt), 'MMM dd, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => setSelectedTransaction(transaction)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {transaction.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="sm" className="text-green-400 hover:bg-green-400/20" onClick={() => handleVerifyPayment(transaction, 'approve')}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/20" onClick={() => handleVerifyPayment(transaction, 'reject')}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white">No transactions found</h3>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/10 border shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Payment Accounts</CardTitle>
                  <CardDescription className="text-gray-300">Configure payment accounts for receiving payments</CardDescription>
                </div>
                <Button onClick={() => setAccountDialog(true)} className="bg-white text-black hover:bg-gray-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(paymentAccounts as any[])?.map((account: any) => (
                  <Card key={account.id} className="bg-white/5 border-white/20 border shadow-none text-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-blue-400" />
                          <span className="font-semibold uppercase tracking-wider">{account.provider}</span>
                        </div>
                        <Badge variant={account.isEnabled ? 'default' : 'secondary'} className={account.isEnabled ? 'bg-green-500/80' : ''}>
                          {account.isEnabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Account Name</p>
                          <p className="font-medium text-white">{account.accountName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Account Number</p>
                          <p className="font-mono text-blue-300">{account.accountNumber}</p>
                        </div>
                        {account.merchantId && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Merchant ID</p>
                            <p className="font-mono text-gray-200">{account.merchantId}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!(paymentAccounts as any[])?.length) && (
                  <Card className="bg-transparent border-dashed border-2 border-white/20 col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Building className="w-12 h-12 text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-white">No payment accounts configured</h3>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/10 border shadow-none text-white">
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
              <CardDescription className="text-gray-300">Manage customer refund requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Course</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(refunds as any[])?.map((refund: any) => (
                    <TableRow key={refund.id} className="border-white/5 hover:bg-white/5">
                      <TableCell>
                        <p className="font-medium">{refund.customer?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{refund.customer?.email}</p>
                      </TableCell>
                      <TableCell>{refund.course?.title || '—'}</TableCell>
                      <TableCell>${refund.refundAmount}</TableCell>
                      <TableCell><Badge className="bg-white/10">{refund.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20"><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/10 border shadow-none">
              <CardHeader><CardTitle className="text-white">Revenue Trends</CardTitle></CardHeader>
              <CardContent className="h-64 flex items-center justify-center text-gray-400">
                Revenue visualization layer
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border-white/10 border shadow-none">
              <CardHeader><CardTitle className="text-white">Payment Methods</CardTitle></CardHeader>
              <CardContent className="h-64 flex items-center justify-center text-gray-400">
                Distribution breakdown layer
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={accountDialog} onOpenChange={setAccountDialog}>
        <DialogContent className="bg-gray-950 border-white/20 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add Payment Account</DialogTitle>
            <DialogDescription className="text-gray-400">Configure a new account for payments</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Provider</Label>
              <Select onValueChange={(v) => setAccountData({ ...accountData, provider: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-white/20">
                  <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Account Name</Label>
              <Input
                value={accountData.accountName}
                onChange={(e) => setAccountData({ ...accountData, accountName: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Account Number</Label>
              <Input
                value={accountData.accountNumber}
                onChange={(e) => setAccountData({ ...accountData, accountNumber: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setAccountDialog(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={handleSaveAccount} disabled={saveAccountMutation.isPending} className="bg-white text-black hover:bg-gray-200">
                Save Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}