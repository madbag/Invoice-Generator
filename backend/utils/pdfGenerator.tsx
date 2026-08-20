import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const COLORS = {
  blue: "#2563eb",
  gray500: "#6b7280",
  gray200: "#e5e7eb",
  gray900: "#111827",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.gray900,
  },
  header: {
    backgroundColor: COLORS.blue,
    color: "#ffffff",
    paddingHorizontal: 50,
    paddingVertical: 28,
    flexDirection: "row",
    alignItems: "center",
  },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRight: { flex: 1, alignItems: "flex-end" },
  businessName: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 6,
    objectFit: "cover",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 6,
    borderWidth: 2,
    borderColor: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { color: "#ffffff", fontSize: 15, fontFamily: "Helvetica-Bold" },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", textAlign: "center" },
  headerInvoiceNo: { fontSize: 11, marginTop: 4, textAlign: "center" },
  headerDateLabel: { fontSize: 9, textAlign: "right" },
  headerDateValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginTop: 2,
  },
  body: { paddingHorizontal: 50, paddingTop: 30, paddingBottom: 40 },
  billTo: { marginBottom: 20 },
  billToLabel: { fontSize: 9, color: COLORS.gray500, marginBottom: 4 },
  clientName: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  clientDetail: { fontSize: 10, color: COLORS.gray500, marginBottom: 1 },
  table: { marginTop: 24 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
    paddingVertical: 6,
  },
  colDescription: { width: "46%" },
  colQty: { width: "12%", textAlign: "center" },
  colPrice: { width: "18%", textAlign: "right" },
  colTotal: { width: "24%", textAlign: "right" },
  colTotalCell: { width: "24%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  headerCell: { fontSize: 9, color: COLORS.gray500 },
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "baseline",
    borderTopWidth: 1,
    borderTopColor: COLORS.gray900,
    marginTop: 12,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 13, fontFamily: "Helvetica-Bold", marginRight: 20 },
  totalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: COLORS.blue },
  footerContainer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
  },
  footer: {
    textAlign: "center",
    fontSize: 9,
    color: COLORS.gray500,
  },
  socialLine: {
    marginTop: 2,
    textAlign: "center",
    fontSize: 9,
    color: COLORS.gray500,
  },
});

const eur = (amount: number) =>
  amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

const formatDate = (date: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface InvoiceItem {
  description: string;
  quantity: number;
  cost: number;
}

interface InvoiceData {
  invoiceNo: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  contactNumber?: string;
  invoiceDate: string;
  items: InvoiceItem[];
  total: number;
  profilePicture?: string | null;
  profileInitials?: string | null;
  businessName?: string | null;
  ownerEmail?: string | null;
  businessContact?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
  other?: string | null;
}

const InvoiceDocument = ({ invoice }: { invoice: InvoiceData }) => {
  const businessLine = [
    invoice.businessName,
    invoice.ownerEmail,
    invoice.businessContact,
  ]
    .filter(Boolean)
    .join("   •   ");

  const socialLine = [
    invoice.instagram ? `Instagram: ${invoice.instagram}` : null,
    invoice.facebook ? `Facebook: ${invoice.facebook}` : null,
    invoice.website ? `Website: ${invoice.website}` : null,
    invoice.other,
  ]
    .filter(Boolean)
    .join("   •   ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {invoice.profilePicture ? (
              <Image src={invoice.profilePicture} style={styles.avatar} />
            ) : invoice.profileInitials ? (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{invoice.profileInitials}</Text>
              </View>
            ) : null}
            {invoice.businessName ? (
              <Text style={styles.businessName}>{invoice.businessName}</Text>
            ) : null}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>INVOICE</Text>
            <Text style={styles.headerInvoiceNo}>{invoice.invoiceNo}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDateLabel}>Invoice Date</Text>
            <Text style={styles.headerDateValue}>
              {formatDate(invoice.invoiceDate)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.billTo}>
            <Text style={styles.billToLabel}>BILL TO</Text>
            <Text style={styles.clientName}>{invoice.clientName}</Text>
            {invoice.contactNumber ? (
              <Text style={styles.clientDetail}>{invoice.contactNumber}</Text>
            ) : null}
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, styles.colDescription]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.headerCell, styles.colQty]}>QTY</Text>
              <Text style={[styles.headerCell, styles.colPrice]}>PRICE</Text>
              <Text style={[styles.headerCell, styles.colTotal]}>TOTAL</Text>
            </View>

            {invoice.items.map((item, index) => (
              <View style={styles.tableRow} key={index} wrap={false}>
                <Text style={styles.colDescription}>{item.description}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{eur(item.cost)}</Text>
                <Text style={styles.colTotalCell}>
                  {eur(item.quantity * item.cost)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{eur(invoice.total)}</Text>
          </View>
        </View>

        <View style={styles.footerContainer} fixed>
          <Text style={styles.footer}>Thank you for your business!</Text>
          {businessLine ? <Text style={styles.socialLine}>{businessLine}</Text> : null}
          {socialLine ? <Text style={styles.socialLine}>{socialLine}</Text> : null}
        </View>
      </Page>
    </Document>
  );
};

export const PDFGenerator = (invoice: InvoiceData): Promise<Buffer> => {
  if (!invoice || !Array.isArray(invoice.items)) {
    return Promise.reject(new Error("Invoice items are required"));
  }
  return renderToBuffer(<InvoiceDocument invoice={invoice} />);
};
