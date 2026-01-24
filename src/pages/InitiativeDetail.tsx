import { useParams, Link } from 'react-router-dom';
import { useInitiative } from '@/hooks/useInitiatives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, FileCode, Video, Phone, Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const InitiativeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: initiative, isLoading, error } = useInitiative(id!);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-destructive">Failed to load initiative details.</p>
        <Button asChild>
          <Link to="/">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          {initiative.logo_url ? (
            <img
              src={initiative.logo_url}
              alt={initiative.name}
              className="h-12 w-12 rounded-lg object-contain"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {initiative.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{initiative.name}</h1>
            <div className="flex items-center gap-2">
              {initiative.category && (
                <span className="text-sm text-muted-foreground">{initiative.category}</span>
              )}
              <Badge variant={initiative.status === 'active' ? 'default' : 'secondary'}>
                {initiative.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {initiative.overview && (
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{initiative.overview}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Partner Integrations
        </h2>

        {initiative.initiative_partners && initiative.initiative_partners.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {initiative.initiative_partners.map((ip) => (
              <AccordionItem key={ip.id} value={ip.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    {ip.partner?.logo_url ? (
                      <img
                        src={ip.partner.logo_url}
                        alt={ip.partner.name}
                        className="h-8 w-8 rounded object-contain"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {ip.partner?.name?.charAt(0) || 'P'}
                        </span>
                      </div>
                    )}
                    <span className="font-medium">{ip.partner?.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Tabs defaultValue="commercial" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="commercial">Commercial</TabsTrigger>
                      <TabsTrigger value="api">API Docs</TabsTrigger>
                      <TabsTrigger value="video">Video</TabsTrigger>
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="support">Support</TabsTrigger>
                    </TabsList>

                    <TabsContent value="commercial" className="mt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Price Per Call</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              {ip.currency || '₹'} {ip.pricing_per_call || 'N/A'}
                              <span className="text-sm font-normal text-muted-foreground ml-1">
                                / {ip.pricing_unit || 'call'}
                              </span>
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Integration Cost</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              {ip.integration_cost ? `₹${ip.integration_cost.toLocaleString()}` : 'N/A'}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Annual Cost</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              {ip.annual_cost ? `₹${ip.annual_cost.toLocaleString()}` : 'N/A'}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      {ip.billing_contact && (
                        <div>
                          <h4 className="font-medium mb-1">Billing Contact</h4>
                          <p className="text-sm text-muted-foreground">{ip.billing_contact}</p>
                        </div>
                      )}
                      {ip.terms_and_conditions && (
                        <div>
                          <h4 className="font-medium mb-1">Terms & Conditions</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {ip.terms_and_conditions}
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="api" className="mt-4 space-y-4">
                      {ip.api_documentation ? (
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(ip.api_documentation!, `doc-${ip.id}`)}
                          >
                            {copiedId === `doc-${ip.id}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{ip.api_documentation}</code>
                          </pre>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No API documentation available.</p>
                      )}

                      {ip.api_specifications && ip.api_specifications.length > 0 && (
                        <div className="space-y-4">
                          {ip.api_specifications.map((spec) => (
                            <Card key={spec.id}>
                              <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <FileCode className="h-4 w-4" />
                                  API Specification v{spec.version}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {spec.input_parameters && Array.isArray(spec.input_parameters) && (
                                  <div>
                                    <h5 className="font-medium mb-2">Input Parameters</h5>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Type</TableHead>
                                          <TableHead>Required</TableHead>
                                          <TableHead>Description</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(spec.input_parameters as Array<{ name: string; type: string; required: boolean; description: string }>).map((param, idx) => (
                                          <TableRow key={idx}>
                                            <TableCell className="font-mono text-sm">{param.name}</TableCell>
                                            <TableCell>{param.type}</TableCell>
                                            <TableCell>
                                              <Badge variant={param.required ? 'default' : 'secondary'}>
                                                {param.required ? 'Yes' : 'No'}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                              {param.description}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                                {spec.output_parameters && Array.isArray(spec.output_parameters) && (
                                  <div>
                                    <h5 className="font-medium mb-2">Output Parameters</h5>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Type</TableHead>
                                          <TableHead>Description</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(spec.output_parameters as Array<{ name: string; type: string; description: string }>).map((param, idx) => (
                                          <TableRow key={idx}>
                                            <TableCell className="font-mono text-sm">{param.name}</TableCell>
                                            <TableCell>{param.type}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                              {param.description}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="video" className="mt-4">
                      {ip.video_url ? (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              {ip.video_title || 'Integration Tutorial'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {ip.video_description && (
                              <p className="text-sm text-muted-foreground mb-4">
                                {ip.video_description}
                              </p>
                            )}
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <iframe
                                src={ip.video_url}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <p className="text-muted-foreground">No video tutorial available.</p>
                      )}
                    </TabsContent>

                    <TabsContent value="products" className="mt-4">
                      {ip.initiative_partner_products && ip.initiative_partner_products.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {ip.initiative_partner_products.map((ipp) => (
                            <Card key={ipp.id}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm">
                                    {ipp.product?.name || 'Unknown Product'}
                                  </CardTitle>
                                  <Badge variant={ipp.usage_status === 'in_use' ? 'default' : 'secondary'}>
                                    {ipp.usage_status === 'in_use' ? 'Live' : ipp.usage_status || 'planned'}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                {ipp.implementation_date && (
                                  <p className="text-xs text-muted-foreground">
                                    Implemented: {new Date(ipp.implementation_date).toLocaleDateString()}
                                  </p>
                                )}
                                {ipp.notes && (
                                  <p className="text-sm mt-2">{ipp.notes}</p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No products mapped yet.</p>
                      )}
                    </TabsContent>

                    <TabsContent value="support" className="mt-4">
                      {ip.support_details ? (
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Support Contacts
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <h5 className="font-medium mb-2">Production Contact</h5>
                                  <div className="text-sm space-y-1">
                                    <p>{ip.support_details.production_contact_name || 'N/A'}</p>
                                    <p className="text-muted-foreground">
                                      {ip.support_details.production_contact_email}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {ip.support_details.production_contact_phone}
                                    </p>
                                  </div>
                                </div>
                                {ip.support_details.sandbox_contact && (
                                  <div>
                                    <h5 className="font-medium mb-2">Sandbox Contact</h5>
                                    <p className="text-sm text-muted-foreground">
                                      {ip.support_details.sandbox_contact}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {ip.support_details.known_issues && (
                                <div>
                                  <h5 className="font-medium mb-2">Known Issues</h5>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {ip.support_details.known_issues}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No support details available.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No partner integrations configured yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InitiativeDetail;
