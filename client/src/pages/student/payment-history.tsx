import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Receipt, 
  CreditCard, 
  RefreshCw, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800"
};

const verificationColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};

export default function PaymentHistory() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refundDialog, setRefundDialog] = useState(false);
  const [refundData, setRefundData] = useState({ amount: '', reason: '', notes: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['/api/student/payments'],
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['/api/payment-history', selectedPayment?.id],
    enabled: !!selectedPayment?.id,
  });

  const { data: receipt } = useQuery({
    queryKey: ['/api/receipts', selectedPayment?.id],
    enabled: !!selectedPayment?.id && selectedPayment?.receiptNumber,
  });

  const { data: refunds } = useQuery({
    queryKey: ['/api/refunds', selectedPayment?.id],
    enabled: !!selectedPayment?.id,
  });

  const refundMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create refund request');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Refund Request Submitted",
        description: "Your refund request has been submitted and will be reviewed by our team.",
      });
      setRefundDialog(false);
      setRefundData({ amount: '', reason: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/refunds'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit refund request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefundSubmit = () => {
    if (!selectedPayment || !refundData.reason) return;

    refundMutation.mutate({
      transactionId: selectedPayment.id,
      amount: parseFloat(refundData.amount) || selectedPayment.amount,
      reason: refundData.reason,
      notes: refundData.notes,
    });
  };

  const downloadReceipt = () => {
    if (receipt?.pdf_url) {
      window.open(receipt.pdf_url, '_blank');
    } else {
      toast({
        title: "Receipt not available",
        description: "Receipt PDF is not yet generated.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment History</h1>
          <p className="text-gray-600">View your course purchases and payment details</p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          <span className="font-medium">{payments?.length || 0} Payments</span>
        </div>
      </div>

      {!payments?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No payments found</h3>
            <p className="text-gray-500">You haven't made any course purchases yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment: any) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={payment.course.imageUrl || '/placeholder-course.jpg'}
                        alt={payment.course.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{payment.course.title}</h3>
                        <p className="text-sm text-gray-600">
                          {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">
                        ${payment.amount.toFixed(2)}
                      </span>
                      {payment.discountAmount > 0 && (
                        <span className="text-green-600">
                          Save ${payment.discountAmount.toFixed(2)}
                        </span>
                      )}
                      <span className="text-gray-600">
                        via {payment.paymentMethod}
                      </span>
                      <Badge className={statusColors[payment.status as keyof typeof statusColors]}>
                        {payment.status}
                      </Badge>
                      <Badge className={verificationColors[payment.verificationStatus as keyof typeof verificationColors]}>
                        {payment.verificationStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.receiptNumber && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          downloadReceipt();
                        }}
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        Receipt
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Payment Details</DialogTitle>
                          <DialogDescription>
                            Complete information about your payment
                          </DialogDescription>
                        </DialogHeader>

                        {selectedPayment && (
                          <div className="space-y-6">
                            {/* Payment Summary */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Transaction ID</Label>
                                <p className="font-mono text-sm">{selectedPayment.id}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Payment Date</Label>
                                <p>{format(new Date(selectedPayment.createdAt), 'PPP')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Amount Paid</Label>
                                <p className="font-semibold">${selectedPayment.amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Payment Method</Label>
                                <p>{selectedPayment.paymentMethod}</p>
                              </div>
                            </div>

                            {/* Receipt Section */}
                            {receipt && (
                              <div>
                                <Label className="text-sm font-medium">Receipt</Label>
                                <div className="mt-2 p-4 border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">Receipt #{receipt.receipt_number}</p>
                                      <p className="text-sm text-gray-600">
                                        Generated: {format(new Date(receipt.created_at), 'PPP')}
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={downloadReceipt}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download PDF
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Payment History */}
                            {paymentHistory && paymentHistory.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">Payment History</Label>
                                <div className="mt-2">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Performed By</TableHead>
                                        <TableHead>Notes</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {paymentHistory.map((entry: any) => (
                                        <TableRow key={entry.id}>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {entry.action}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {format(new Date(entry.createdAt), 'PPp')}
                                          </TableCell>
                                          <TableCell>
                                            {entry.performedBy?.name || 'System'}
                                          </TableCell>
                                          <TableCell>{entry.notes || '-'}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {/* Refunds Section */}
                            {refunds && refunds.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">Refund Requests</Label>
                                <div className="mt-2">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {refunds.map((refund: any) => (
                                        <TableRow key={refund.id}>
                                          <TableCell>${refund.refundAmount.toFixed(2)}</TableCell>
                                          <TableCell>{refund.reason}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {refund.status}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {format(new Date(refund.createdAt), 'PPp')}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {/* Request Refund */}
                            {selectedPayment.status === 'completed' && 
                             selectedPayment.verificationStatus === 'approved' && (
                              <div className="pt-4 border-t">
                                <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline">
                                      <RefreshCw className="w-4 h-4 mr-2" />
                                      Request Refund
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Request Refund</DialogTitle>
                                      <DialogDescription>
                                        Submit a refund request for this payment
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="refund-amount">Refund Amount</Label>
                                        <Input
                                          id="refund-amount"
                                          type="number"
                                          step="0.01"
                                          max={selectedPayment.amount}
                                          value={refundData.amount}
                                          onChange={(e) => setRefundData({
                                            ...refundData,
                                            amount: e.target.value
                                          })}
                                          placeholder={`Max: $${selectedPayment.amount.toFixed(2)}`}
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="refund-reason">Reason for Refund</Label>
                                        <Textarea
                                          id="refund-reason"
                                          value={refundData.reason}
                                          onChange={(e) => setRefundData({
                                            ...refundData,
                                            reason: e.target.value
                                          })}
                                          placeholder="Please explain why you're requesting a refund..."
                                          required
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="refund-notes">Additional Notes (Optional)</Label>
                                        <Textarea
                                          id="refund-notes"
                                          value={refundData.notes}
                                          onChange={(e) => setRefundData({
                                            ...refundData,
                                            notes: e.target.value
                                          })}
                                          placeholder="Any additional information..."
                                        />
                                      </div>
                                      
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => setRefundDialog(false)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleRefundSubmit}
                                          disabled={!refundData.reason || refundMutation.isPending}
                                        >
                                          {refundMutation.isPending ? (
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                          ) : null}
                                          Submit Request
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}