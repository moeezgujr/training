import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Download
} from "lucide-react";

interface PaymentTransaction {
  id: string;
  userId: string;
  courseId: string;
  paymentMethod: string;
  amount: number;
  originalAmount: number;
  discountAmount: number;
  promoCode?: string;
  transactionId?: string;
  paymentReference?: string;
  paymentProofUrl?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  paymentDate?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  course?: {
    title: string;
    imageUrl: string;
  };
}

export default function PaymentVerificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/admin/payment-transactions'],
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: 'approve' | 'reject'; notes?: string }) => {
      return await apiRequest('POST', `/api/admin/payment-transactions/${id}/verify`, {
        action,
        notes,
        rejectionReason: action === 'reject' ? rejectionReason : undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-transactions'] });
      setSelectedTransaction(null);
      setVerificationNotes("");
      setRejectionReason("");
      toast({
        title: "Success",
        description: "Payment verification completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      });
    },
  });

  const filterTransactions = (status: string) => {
    if (status === "pending") {
      return transactions.filter((t: PaymentTransaction) => t.verificationStatus === 'pending');
    } else if (status === "approved") {
      return transactions.filter((t: PaymentTransaction) => t.verificationStatus === 'approved');
    } else if (status === "rejected") {
      return transactions.filter((t: PaymentTransaction) => t.verificationStatus === 'rejected');
    }
    return transactions;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const TransactionCard = ({ transaction }: { transaction: PaymentTransaction }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {formatAmount(transaction.amount)}
              </CardTitle>
              <CardDescription>
                {transaction.course?.title || 'Course Purchase'}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getStatusColor(transaction.verificationStatus)} text-white`}>
            {transaction.verificationStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Student</p>
            <p className="font-medium">
              {transaction.user?.firstName} {transaction.user?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{transaction.user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium capitalize">{transaction.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{formatDate(transaction.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reference</p>
            <p className="font-medium">{transaction.paymentReference || 'N/A'}</p>
          </div>
        </div>

        {transaction.discountAmount > 0 && (
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <p className="text-sm">
              <span className="font-medium">Original Amount:</span> {formatAmount(transaction.originalAmount)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Discount:</span> -{formatAmount(transaction.discountAmount)}
              {transaction.promoCode && ` (${transaction.promoCode})`}
            </p>
            <p className="text-sm font-medium">
              <span className="font-medium">Final Amount:</span> {formatAmount(transaction.amount)}
            </p>
          </div>
        )}

        {transaction.paymentProofUrl && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Payment Proof</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(transaction.paymentProofUrl, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Proof
            </Button>
          </div>
        )}

        {transaction.notes && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm font-medium mb-1">Admin Notes</p>
            <p className="text-sm">{transaction.notes}</p>
          </div>
        )}

        {transaction.rejectionReason && (
          <div className="bg-red-50 p-3 rounded-lg mb-4">
            <p className="text-sm font-medium mb-1">Rejection Reason</p>
            <p className="text-sm">{transaction.rejectionReason}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Payment Transaction Details</DialogTitle>
                <DialogDescription>
                  Review and verify payment transaction
                </DialogDescription>
              </DialogHeader>
              <PaymentDetailsModal 
                transaction={transaction}
                verificationNotes={verificationNotes}
                setVerificationNotes={setVerificationNotes}
                rejectionReason={rejectionReason}
                setRejectionReason={setRejectionReason}
                onVerify={verifyMutation.mutate}
                isLoading={verifyMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          {transaction.verificationStatus === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => verifyMutation.mutate({ 
                  id: transaction.id, 
                  action: 'approve',
                  notes: 'Quick approval'
                })}
                disabled={verifyMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedTransaction(transaction);
                  setRejectionReason("Please provide a valid payment proof");
                }}
                disabled={verifyMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div>
        <AdminHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = filterTransactions('pending').length;
  const approvedCount = filterTransactions('approved').length;
  const rejectedCount = filterTransactions('rejected').length;

  return (
    <div>
      <AdminHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Payment Verifications</h1>
            <p className="text-muted-foreground">
              Review and verify student payment submissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pending Verifications</CardTitle>
                <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Approved</CardTitle>
                <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Rejected</CardTitle>
                <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
              </CardHeader>
            </Card>
          </div>

          {/* Verification Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedCount})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({transactions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {filterTransactions('pending').length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Verifications</h3>
                    <p className="text-muted-foreground">
                      All payments have been reviewed and verified.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filterTransactions('pending').map((transaction: PaymentTransaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {filterTransactions('approved').map((transaction: PaymentTransaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {filterTransactions('rejected').map((transaction: PaymentTransaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {transactions.map((transaction: PaymentTransaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

interface PaymentDetailsModalProps {
  transaction: PaymentTransaction;
  verificationNotes: string;
  setVerificationNotes: (notes: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onVerify: (data: { id: string; action: 'approve' | 'reject'; notes?: string }) => void;
  isLoading: boolean;
}

function PaymentDetailsModal({
  transaction,
  verificationNotes,
  setVerificationNotes,
  rejectionReason,
  setRejectionReason,
  onVerify,
  isLoading
}: PaymentDetailsModalProps) {
  return (
    <div className="space-y-6">
      {/* Transaction Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Transaction ID</Label>
          <p className="text-sm">{transaction.id}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Payment Reference</Label>
          <p className="text-sm">{transaction.paymentReference || 'N/A'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Amount</Label>
          <p className="text-sm font-semibold">PKR {transaction.amount.toLocaleString()}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Payment Method</Label>
          <p className="text-sm capitalize">{transaction.paymentMethod}</p>
        </div>
      </div>

      {/* Payment Proof */}
      {transaction.paymentProofUrl && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Payment Proof</Label>
          <div className="border rounded-lg p-4">
            <img 
              src={transaction.paymentProofUrl} 
              alt="Payment Proof" 
              className="max-w-full h-auto rounded"
              style={{ maxHeight: '300px' }}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.open(transaction.paymentProofUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Size
            </Button>
          </div>
        </div>
      )}

      {transaction.verificationStatus === 'pending' && (
        <>
          {/* Verification Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Verification Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this verification..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Rejection Reason */}
          <div>
            <Label htmlFor="rejection" className="text-sm font-medium">
              Rejection Reason (Required for rejection)
            </Label>
            <Textarea
              id="rejection"
              placeholder="Provide a clear reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onVerify({ 
                id: transaction.id, 
                action: 'approve',
                notes: verificationNotes 
              })}
              disabled={isLoading}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Payment
            </Button>
            <Button
              variant="destructive"
              onClick={() => onVerify({ 
                id: transaction.id, 
                action: 'reject',
                notes: rejectionReason 
              })}
              disabled={isLoading || !rejectionReason.trim()}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Payment
            </Button>
          </div>
        </>
      )}
    </div>
  );
}