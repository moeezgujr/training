import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Plus,
  Edit,
  Trash2,
  Save
} from "lucide-react";

interface PaymentSettings {
  id: string;
  provider: string;
  isEnabled: boolean;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  accountTitle?: string;
  iban?: string;
  branchCode?: string;
  instructions?: string;
  minAmount: string;
  maxAmount?: string;
  processingFee: string;
  createdAt: string;
  updatedAt: string;
}

const paymentProviders = [
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    icon: Smartphone,
    description: 'Mobile wallet payments via EasyPaisa',
    color: 'bg-green-500'
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: Smartphone,
    description: 'Mobile wallet payments via JazzCash',
    color: 'bg-orange-500'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Direct bank account transfers',
    color: 'bg-blue-500'
  },
  {
    id: 'stripe',
    name: 'Credit/Debit Cards',
    icon: CreditCard,
    description: 'International card payments via Stripe',
    color: 'bg-purple-500'
  }
];

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState<string>('');

  const { data: paymentSettings = [], isLoading } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/admin/payment-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setNewProvider('');
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/admin/payment-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setEditingId(null);
      toast({
        title: "Success",
        description: "Payment settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment settings",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/payment-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove payment method",
        variant: "destructive",
      });
    },
  });

  const handleCreateProvider = (providerId: string) => {
    const provider = paymentProviders.find(p => p.id === providerId);
    if (!provider) return;

    const defaultData = {
      provider: providerId,
      isEnabled: true,
      minAmount: "0",
      processingFee: "0",
      instructions: `Pay via ${provider.name}. After payment, please share the transaction screenshot for verification.`
    };

    createMutation.mutate(defaultData);
  };

  const handleUpdateSettings = (id: string, formData: FormData) => {
    const data = {
      isEnabled: formData.get('isEnabled') === 'on',
      accountNumber: formData.get('accountNumber') || undefined,
      accountName: formData.get('accountName') || undefined,
      bankName: formData.get('bankName') || undefined,
      accountTitle: formData.get('accountTitle') || undefined,
      iban: formData.get('iban') || undefined,
      branchCode: formData.get('branchCode') || undefined,
      instructions: formData.get('instructions') || undefined,
      minAmount: formData.get('minAmount') || "0",
      maxAmount: formData.get('maxAmount') || undefined,
      processingFee: formData.get('processingFee') || "0",
    };

    updateMutation.mutate({ id, data });
  };

  const getProviderInfo = (providerId: string) => {
    return paymentProviders.find(p => p.id === providerId);
  };

  const availableProviders = paymentProviders.filter(
    provider => !paymentSettings.some((setting: PaymentSettings) => setting.provider === provider.id)
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

  return (
    <div>
      <AdminHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Payment Settings</h1>
            <p className="text-muted-foreground">
              Configure payment methods and receiving account details for course purchases.
            </p>
          </div>

        {/* Add New Provider */}
        {availableProviders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Payment Method
              </CardTitle>
              <CardDescription>
                Add a new payment method for students to purchase courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableProviders.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <Card 
                      key={provider.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCreateProvider(provider.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`inline-flex p-3 rounded-full ${provider.color} mb-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {provider.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configured Payment Methods */}
        <div className="space-y-4">
          {paymentSettings.map((setting: PaymentSettings) => {
            const providerInfo = getProviderInfo(setting.provider);
            const Icon = providerInfo?.icon || CreditCard;
            const isEditing = editingId === setting.id;

            return (
              <Card key={setting.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${providerInfo?.color || 'bg-gray-500'}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {providerInfo?.name || setting.provider}
                        </CardTitle>
                        <CardDescription>
                          {providerInfo?.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={setting.isEnabled ? "default" : "secondary"}>
                        {setting.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(isEditing ? null : setting.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(setting.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {isEditing ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleUpdateSettings(setting.id, formData);
                      }}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <Switch 
                          name="isEnabled"
                          defaultChecked={setting.isEnabled}
                        />
                        <Label>Enable this payment method</Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(setting.provider === 'easypaisa' || setting.provider === 'jazzcash') && (
                          <>
                            <div>
                              <Label htmlFor="accountNumber">Account Number</Label>
                              <Input 
                                name="accountNumber"
                                placeholder="03xxxxxxxxx"
                                defaultValue={setting.accountNumber || ''}
                              />
                            </div>
                            <div>
                              <Label htmlFor="accountName">Account Name</Label>
                              <Input 
                                name="accountName"
                                placeholder="Account holder name"
                                defaultValue={setting.accountName || ''}
                              />
                            </div>
                          </>
                        )}

                        {setting.provider === 'bank_transfer' && (
                          <>
                            <div>
                              <Label htmlFor="bankName">Bank Name</Label>
                              <Input 
                                name="bankName"
                                placeholder="e.g., HBL, UBL, MCB"
                                defaultValue={setting.bankName || ''}
                              />
                            </div>
                            <div>
                              <Label htmlFor="accountTitle">Account Title</Label>
                              <Input 
                                name="accountTitle"
                                placeholder="Account holder name"
                                defaultValue={setting.accountTitle || ''}
                              />
                            </div>
                            <div>
                              <Label htmlFor="iban">IBAN</Label>
                              <Input 
                                name="iban"
                                placeholder="PK36SCBL0000001123456702"
                                defaultValue={setting.iban || ''}
                              />
                            </div>
                            <div>
                              <Label htmlFor="branchCode">Branch Code</Label>
                              <Input 
                                name="branchCode"
                                placeholder="1234"
                                defaultValue={setting.branchCode || ''}
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <Label htmlFor="minAmount">Minimum Amount (PKR)</Label>
                          <Input 
                            name="minAmount"
                            type="number"
                            placeholder="0"
                            defaultValue={setting.minAmount}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxAmount">Maximum Amount (PKR)</Label>
                          <Input 
                            name="maxAmount"
                            type="number"
                            placeholder="No limit"
                            defaultValue={setting.maxAmount || ''}
                          />
                        </div>
                        <div>
                          <Label htmlFor="processingFee">Processing Fee (%)</Label>
                          <Input 
                            name="processingFee"
                            type="number"
                            step="0.01"
                            placeholder="0"
                            defaultValue={setting.processingFee}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="instructions">Payment Instructions</Label>
                        <Textarea 
                          name="instructions"
                          placeholder="Instructions for customers on how to make payment..."
                          defaultValue={setting.instructions || ''}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={updateMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {setting.accountNumber && (
                        <div>
                          <span className="font-medium">Account: </span>
                          <span>{setting.accountNumber}</span>
                          {setting.accountName && <span> ({setting.accountName})</span>}
                        </div>
                      )}
                      
                      {setting.iban && (
                        <div>
                          <span className="font-medium">IBAN: </span>
                          <span className="font-mono">{setting.iban}</span>
                        </div>
                      )}

                      {setting.bankName && (
                        <div>
                          <span className="font-medium">Bank: </span>
                          <span>{setting.bankName}</span>
                          {setting.branchCode && <span> (Branch: {setting.branchCode})</span>}
                        </div>
                      )}

                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>Min: PKR {setting.minAmount}</span>
                        {setting.maxAmount && <span>Max: PKR {setting.maxAmount}</span>}
                        {parseFloat(setting.processingFee) > 0 && (
                          <span>Fee: {setting.processingFee}%</span>
                        )}
                      </div>

                      {setting.instructions && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{setting.instructions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {paymentSettings.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Methods Configured</h3>
              <p className="text-muted-foreground mb-4">
                Add payment methods to enable students to purchase courses.
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}