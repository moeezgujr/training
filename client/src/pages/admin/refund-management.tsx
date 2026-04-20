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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { 
  RefreshCw, 
  CheckCircle, 
  X, 
  Clock,
  DollarSign,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Search
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  processed: "bg-blue-100 text-blue-800"
};

export default function RefundManagement() {
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [processDialog, setProcessDialog] = useState(false);
  const [processData, setProcessData] = useState({ action: '', notes: '', refundReference: '' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: refunds, isLoading } = useQuery({
    queryKey: ['/api/admin/refunds'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/payment-analytics'],
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['/api/payment-history', selectedRefund?.transactionId],
    enabled: !!selectedRefund?.transactionId,
  });

  const processRefundMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/refunds/${selectedRefund.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to process refund');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Refund Processed",
        description: `Refund has been ${processData.action}d successfully.`,
      });
      setProcessDialog(false);
      setProcessData({ action: '', notes: '', refundReference: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/refunds'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProcessRefund = () => {
    if (!selectedRefund || !processData.action) return;

    processRefundMutation.mutate({
      action: processData.action,
      notes: processData.notes,
      refundReference: processData.refundReference,
    });
  };

  const filteredRefunds = refunds?.filter((refund: any) => {
    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus;
    const matchesSearch = !searchQuery || 
      refund.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  }) || [];

  const stats = {
    totalRefunds: refunds?.length || 0,
    pendingRefunds: refunds?.filter((r: any) => r.status === 'pending').length || 0,
    approvedRefunds: refunds?.filter((r: any) => r.status === 'approved').length || 0,
    totalRefundAmount: refunds?.reduce((sum: number, r: any) => 
      r.status === 'approved' ? sum + r.refundAmount : sum, 0) || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <AdminHeader title="Refund Management" />
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Refund Management" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold">{stats.totalRefunds}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingRefunds}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedRefunds}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">${stats.totalRefundAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search refunds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>
            Manage and process customer refund requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredRefunds.length ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No refunds found</h3>
              <p className="text-gray-500">No refund requests match your current filters.</p>
            </div>
          ) : (
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
                {filteredRefunds.map((refund: any) => (
                  <TableRow key={refund.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{refund.customer.name}</p>
                        <p className="text-sm text-gray-600">{refund.customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{refund.course.title}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">${refund.refundAmount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate" title={refund.reason}>
                        {refund.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[refund.status as keyof typeof statusColors]}>
                        {refund.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(refund.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRefund(refund)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Refund Request Details</DialogTitle>
                              <DialogDescription>
                                Complete information about the refund request
                              </DialogDescription>
                            </DialogHeader>

                            {selectedRefund && (
                              <div className="space-y-6">
                                {/* Refund Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Customer</Label>
                                    <p>{selectedRefund.customer.name}</p>
                                    <p className="text-sm text-gray-600">{selectedRefund.customer.email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Course</Label>
                                    <p>{selectedRefund.course.title}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Refund Amount</Label>
                                    <p className="font-semibold text-lg">${selectedRefund.refundAmount.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Request Date</Label>
                                    <p>{format(new Date(selectedRefund.createdAt), 'PPP')}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-sm font-medium">Reason</Label>
                                    <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRefund.reason}</p>
                                  </div>
                                  {selectedRefund.notes && (
                                    <div className="col-span-2">
                                      <Label className="text-sm font-medium">Additional Notes</Label>
                                      <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRefund.notes}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Processing Information */}
                                {selectedRefund.processedBy && (
                                  <div className="border-t pt-4">
                                    <Label className="text-sm font-medium">Processing Information</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-600">Processed By</p>
                                        <p>{selectedRefund.processedBy.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Processed Date</p>
                                        <p>{format(new Date(selectedRefund.processedAt), 'PPp')}</p>
                                      </div>
                                      {selectedRefund.refundReference && (
                                        <div>
                                          <p className="text-sm text-gray-600">Reference</p>
                                          <p className="font-mono">{selectedRefund.refundReference}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Payment History */}
                                {paymentHistory && paymentHistory.length > 0 && (
                                  <div className="border-t pt-4">
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

                                {/* Process Refund Actions */}
                                {selectedRefund.status === 'pending' && (
                                  <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Dialog open={processDialog} onOpenChange={setProcessDialog}>
                                      <DialogTrigger asChild>
                                        <Button
                                          onClick={() => {
                                            setProcessData({ ...processData, action: 'approve' });
                                            setProcessDialog(true);
                                          }}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Approve
                                        </Button>
                                      </DialogTrigger>
                                    </Dialog>
                                    
                                    <Dialog open={processDialog} onOpenChange={setProcessDialog}>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            setProcessData({ ...processData, action: 'reject' });
                                            setProcessDialog(true);
                                          }}
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Reject
                                        </Button>
                                      </DialogTrigger>
                                    </Dialog>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {refund.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setProcessData({ ...processData, action: 'approve' });
                                setProcessDialog(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setProcessData({ ...processData, action: 'reject' });
                                setProcessDialog(true);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Process Refund Dialog */}
      <Dialog open={processDialog} onOpenChange={setProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processData.action === 'approve' ? 'Approve' : 'Reject'} Refund
            </DialogTitle>
            <DialogDescription>
              {processData.action === 'approve' 
                ? 'Approve this refund request and process the payment.'
                : 'Reject this refund request with a reason.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {processData.action === 'approve' && (
              <div>
                <Label htmlFor="refund-reference">Refund Reference (Optional)</Label>
                <Input
                  id="refund-reference"
                  value={processData.refundReference}
                  onChange={(e) => setProcessData({
                    ...processData,
                    refundReference: e.target.value
                  })}
                  placeholder="e.g., Payment gateway reference number"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="process-notes">
                {processData.action === 'approve' ? 'Processing Notes' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="process-notes"
                value={processData.notes}
                onChange={(e) => setProcessData({
                  ...processData,
                  notes: e.target.value
                })}
                placeholder={
                  processData.action === 'approve' 
                    ? "Add any notes about the refund processing..."
                    : "Explain why this refund is being rejected..."
                }
                required={processData.action === 'reject'}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setProcessDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessRefund}
                disabled={
                  (processData.action === 'reject' && !processData.notes) ||
                  processRefundMutation.isPending
                }
                variant={processData.action === 'approve' ? 'default' : 'destructive'}
              >
                {processRefundMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : processData.action === 'approve' ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                {processData.action === 'approve' ? 'Approve Refund' : 'Reject Refund'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}