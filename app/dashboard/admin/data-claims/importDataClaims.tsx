"use client";

import { useState, ChangeEvent, DragEvent, useEffect } from "react";
import { FileUp, X, Loader2 } from "lucide-react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { addManyClients} from "@/lib/redux/clientSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";

interface ImportUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

interface ParsedUser  {
  _id?: string;
  name: string;
  email?: string;
  phoneNumber: string;
  ownerName?: string[]; 
  ownerNumber?: string[];
  // city?: string;
  // age?: number;
  status: string;
  portalName?: string;
  ekyc_stage?: string;
  trade_status?: string;
  reason?: string;
  // leaderCode?: string;
  createdOn?: string;
  updatedOn?: string;
  isApproved?: boolean;
}

export default function ImportUser({ open, onOpenChange, onImportSuccess }: ImportUserProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    name: "",
    email: "",
    phoneNumber: "",
    ekyc_stage: "",
    trade_status: "",
    // qualification: "",
    // city: "",
    // date_of_birth: "",
    // gender: "",
    // message: "",
    status: "",
    portalName: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      handleFileProcessing(file);
    } else {
      toast.error("Please upload a CSV file");
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      handleFileProcessing(file);
    } else if (file) {
      toast.error("Please upload a CSV file");
      e.target.value = ''; // Reset input
    }
  };

  const handleFileProcessing = (file: File) => {
    setSelectedFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0 && typeof results.data[0] === 'object' && results.data[0] !== null) {
          const headers = Object.keys(results.data[0] as object);
          setFileHeaders(headers);
          setAllData(results.data);
          setTotalPages(Math.ceil(results.data.length / itemsPerPage));
          setCurrentPage(1);
          setPreviewData(results.data.slice(0, itemsPerPage));
        }
      },
      error: (error) => {
        toast.error("Error reading CSV file: " + error.message);
      }
    });
  };

  useEffect(() => {
    if (allData.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPreviewData(allData.slice(startIndex, endIndex));
    }
  }, [currentPage, allData]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFieldMapping = (field: string, value: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImport = async () => {
    const requiredFields = ["name", "email", "phoneNumber"];
    const missingRequiredFields = requiredFields.filter(field => !fieldMapping[field]);
    
    if (!selectedFile || missingRequiredFields.length > 0) {
      if (missingRequiredFields.length > 0) {
        toast.error(`Please map required fields: ${missingRequiredFields.join(", ")}`);
      }
      return;
    }
    
    setIsProcessing(true);
    
    try {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const mappedData = results.data.map((row: any) => {
              const mappedUser: ParsedUser = {
                name: row[fieldMapping.name],
                email: row[fieldMapping.email],
                phoneNumber: row[fieldMapping.phoneNumber],
                // city: row[fieldMapping.city],
                status: row[fieldMapping.status],
                portalName: row[fieldMapping.portalName],
                ekyc_stage: row[fieldMapping.ekyc_stage],
                trade_status: row[fieldMapping.trade_status],
              };
              return mappedUser;
            });

            console.log('Mapped clients:', mappedData);
            const response = await dispatch(addManyClients(mappedData));
            if (response) {
              toast.success(`Successfully imported ${mappedData.length} clients`);
              handleReset();
              onOpenChange(false);
              onImportSuccess?.();
            } else {
              toast.error("Failed to import leads: " + (response.error?.message || "Unknown error"));
            }
          } catch (error) {
            toast.error("Error processing data: " + (error as Error).message);
          } finally {
            setIsProcessing(false);
          }
        },
        error: (error) => {
          toast.error("Error parsing CSV: " + error.message);
          setIsProcessing(false);
        },
      });
    } catch (error) {
      toast.error("Import failed: " + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileHeaders([]);
    setPreviewData([]);
    setAllData([]);
    setCurrentPage(1);
    setTotalPages(1);
    setFieldMapping({
      name: "",
      email: "",
      phoneNumber: "",
      // city: "",
      // date_of_birth: "",
      // gender: "",
      // message: "",
      status: "",
      ekyc_stage: "",
      trade_status: "",
      portalName: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleReset();
      onOpenChange(open);
    }}>
      <DialogContent className="max-h-[90vh] w-screen max-w-[95%] !min-w-[80vw] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl">Import Data Claims</DialogTitle>
          <DialogDescription className="text-base">
            Upload a CSV file to import multiple data claims at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 px-6 overflow-y-auto">
          <div className="py-6 space-y-8">
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-200"} p-10`}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <FileUp className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Drag and drop your file here or</h3>
                    <p className="text-sm text-muted-foreground">Supported format: CSV</p>
                  </div>
                  <div className="w-full max-w-sm">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Browse Files
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <FileUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {previewData.length > 0 && (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-6 bg-muted/50">
                      <h3 className="text-lg font-semibold mb-6">Preview & Field Mapping</h3>
                      <p className="text-sm text-muted-foreground mb-4">Fields marked with <span className="text-red-500">*</span> are required</p>
                      <div className="flex gap-6 overflow-x-auto pb-4">
                        {Object.keys(fieldMapping).map((field) => {
                          const isRequired = ["name", "email", "phoneNumber", "ekyc_stage", "trade_status"].includes(field);
                          return (
                          <div key={field} className="min-w-[200px]">
                            <label className="text-sm font-medium capitalize block mb-2">
                              {field.replace(/_/g, ' ')}
                              {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <Select
                              value={fieldMapping[field]}
                              onValueChange={(value) => handleFieldMapping(field, value)}
                            >
                              <SelectTrigger className={`w-full bg-white ${isRequired && !fieldMapping[field] ? "border-red-500" : ""}`}>
                                <SelectValue placeholder="Unmapped" />
                              </SelectTrigger>
                              <SelectContent>
                                {fileHeaders.map((header) => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )})}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {fileHeaders.map((header) => (
                                <TableHead key={header} className="font-semibold">
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.map((row, idx) => (
                              <TableRow key={idx}>
                                {fileHeaders.map((header) => (
                                  <TableCell key={header}>{row[header]}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                          Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, allData.length)} of {allData.length} entries
                        </p>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              <Button
                                variant={currentPage === 1 ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => handlePageChange(1)}
                              >
                                1
                              </Button>
                              
                              {currentPage > 3 && (
                                <span className="px-2">...</span>
                              )}
                              
                              {totalPages > 1 && currentPage !== 1 && currentPage !== totalPages && (
                                <>
                                  {currentPage > 2 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-8 h-8 p-0"
                                      onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                      {currentPage - 1}
                                    </Button>
                                  )}
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                  >
                                    {currentPage}
                                  </Button>
                                  {currentPage < totalPages - 1 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-8 h-8 p-0"
                                      onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                      {currentPage + 1}
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              {currentPage < totalPages - 2 && (
                                <span className="px-2">...</span>
                              )}
                              
                              {totalPages > 1 && (
                                <Button
                                  variant={currentPage === totalPages ? "default" : "outline"}
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => handlePageChange(totalPages)}
                                >
                                  {totalPages}
                                </Button>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={!selectedFile || ["name", "email", "phoneNumber"].some(field => !fieldMapping[field]) || isProcessing}
              onClick={handleImport}
              size="lg"
              className="min-w-[150px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Import Leads"
              )}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
