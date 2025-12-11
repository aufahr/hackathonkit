"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  code: string;
}

export function QRCodeDisplay({ code }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${code}`
    : `/join/${code}`;

  useEffect(() => {
    QRCode.toDataURL(joinUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    }).then(setQrDataUrl);
  }, [joinUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="h-4 w-4 text-primary" />
          Scan to Join
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-xl shadow-lg">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-muted animate-pulse rounded-lg" />
            )}
          </div>
        </div>

        {/* Join Code */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Or enter code:</p>
          <div className="flex items-center justify-center gap-2">
            <code className="text-3xl font-bold tracking-widest bg-muted px-4 py-2 rounded-lg">
              {code}
            </code>
          </div>
        </div>

        {/* Copy Link */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Join Link
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
