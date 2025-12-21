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
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  X,
  RefreshCw,
  Settings,
  Plus,
  Wallet,
  Building,
  Receipt
} from "lucide-react";
import { format } from "date-fns";

export default function PaymentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [accountDialog, setAccountDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [accountData, setAccountData] = useState({
    provider: '',
    accountName: '',
    accountNumber: '',
    merchantId: '',
    apiKey: '',
    isActive: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/admin/payment-transactions'],
  });

  const { data: paymentAccounts } = useQuery({
    queryKey: ['/api/admin/payment-accounts'],
  });

  const { data: paymentStats } = useQuery({
    queryKey: ['/api/admin/payment-stats'],
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
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Verified",
        description: "Payment has been successfully processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-transactions'] });
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/payment-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save payment account');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Account Saved",
        description: "Payment account configuration has been saved.",
      });
      setAccountDialog(false);
      setAccountData({
        provider: '',
        accountName: '',
        accountNumber: '',
        merchantId: '',
        apiKey: '',
        isActive: true
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-accounts'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save payment account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVerifyPayment = (transaction: any, action: 'approve' | 'reject') => {
    verifyPaymentMutation.mutate({
      id: transaction.id,
      action,
      data: {
        notes: action === 'approve' ? 'Payment verified and approved' : 'Payment rejected after review'
      }
    });
  };

  const handleSaveAccount = () => {
    if (!accountData.provider || !accountData.accountName) return;
    saveAccountMutation.mutate(accountData);
  };

  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch = !searchQuery || 
      transaction.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || transaction.paymentMethod === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  }) || [];

  const stats = {
    totalRevenue: paymentStats?.totalRevenue || 0,
    totalTransactions: transactions?.length || 0,
    pendingPayments: transactions?.filter((t: any) => t.status === 'pending').length || 0,
    successfulPayments: transactions?.filter((t: any) => t.status === 'completed').length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <AdminHeader title="Payment Management" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Payment Management" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful Payments</p>
                <p className="text-2xl font-bold text-green-600">{stats.successfulPayments}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Payment Accounts</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                      <SelectItem value="jazzcash">JazzCash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                Manage and verify payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <span className="font-mono text-sm">{transaction.transactionId}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.user?.name}</p>
                          <p className="text-sm text-gray-600">{transaction.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{transaction.course?.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">${transaction.amount}</span>
                        {transaction.discountAmount > 0 && (
                          <div className="text-sm text-green-600">
                            Save ${transaction.discountAmount}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {transaction.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleVerifyPayment(transaction, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleVerifyPayment(transaction, 'reject')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          {transaction.receiptNumber && (
                            <Button variant="ghost" size="sm">
                              <Receipt className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                  <p className="text-gray-500">No transactions match your current filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Accounts</CardTitle>
                  <CardDescription>
                    Configure payment accounts for receiving payments
                  </CardDescription>
                </div>
                <Dialog open={accountDialog} onOpenChange={setAccountDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentAccounts?.map((account: any) => (
                  <Card key={account.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5" />
                          <span className="font-semibold">{account.provider}</span>
                        </div>
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Account Name</p>
                          <p className="font-medium">{account.accountName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Number</p>
                          <p className="font-mono">{account.accountNumber}</p>
                        </div>
                        {account.merchantId && (
                          <div>
                            <p className="text-sm text-gray-600">Merchant ID</p>
                            <p className="font-mono">{account.merchantId}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!paymentAccounts || paymentAccounts.length === 0) && (
                  <Card className="border-dashed border-2 col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Building className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No payment accounts configured</h3>
                      <p className="text-gray-500 mb-4">Add payment accounts to start receiving payments.</p>
                      <Button onClick={() => setAccountDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment Account
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
              <CardDescription>
                Manage customer refund requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds?.map((refund: any) => (
                    <TableRow key={refund.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{refund.customer?.name}</p>
                          <p className="text-sm text-gray-600">{refund.customer?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{refund.course?.title}</TableCell>
                      <TableCell>${refund.refundAmount}</TableCell>
                      <TableCell className="max-w-xs truncate">{refund.reason}</TableCell>
                      <TableCell>
                        <Badge variant={refund.status === 'approved' ? 'default' : 'secondary'}>
                          {refund.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(refund.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {refund.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Revenue chart will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Payment methods breakdown chart
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Payment Account Dialog */}
      <Dialog open={accountDialog} onOpenChange={setAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Account</DialogTitle>
            <DialogDescription>
              Configure a new payment account for receiving payments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Payment Provider</Label>
              <Select value={accountData.provider} onValueChange={(value) => setAccountData({ ...accountData, provider: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                value={accountData.accountName}
                onChange={(e) => setAccountData({ ...accountData, accountName: e.target.value })}
                placeholder="Enter account holder name"
              />
            </div>

            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                value={accountData.accountNumber}
                onChange={(e) => setAccountData({ ...accountData, accountNumber: e.target.value })}
                placeholder="Enter account number"
              />
            </div>

            {(accountData.provider === 'easypaisa' || accountData.provider === 'jazzcash') && (
              <div>
                <Label htmlFor="merchant-id">Merchant ID</Label>
                <Input
                  id="merchant-id"
                  value={accountData.merchantId}
                  onChange={(e) => setAccountData({ ...accountData, merchantId: e.target.value })}
                  placeholder="Enter merchant ID"
                />
              </div>
            )}

            <div>
              <Label htmlFor="api-key">API Key (Optional)</Label>
              <Input
                id="api-key"
                type="password"
                value={accountData.apiKey}
                onChange={(e) => setAccountData({ ...accountData, apiKey: e.target.value })}
                placeholder="Enter API key for automated processing"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAccountDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAccount}
                disabled={!accountData.provider || !accountData.accountName || saveAccountMutation.isPending}
              >
                {saveAccountMutation.isPending ? 'Saving...' : 'Save Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}