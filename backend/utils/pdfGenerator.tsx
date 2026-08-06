import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

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
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  headerInvoiceNo: { fontSize: 11, marginTop: 4 },
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
  footer: {
    marginTop: 40,
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
  clientEmail: string;
  clientAddress?: string;
  contactNumber?: string;
  invoiceDate: string;
  items: InvoiceItem[];
  total: number;
}

const InvoiceDocument = ({ invoice }: { invoice: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>INVOICE</Text>
          <Text style={styles.headerInvoiceNo}>{invoice.invoiceNo}</Text>
        </View>
        <View>
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
          <Text style={styles.clientDetail}>{invoice.clientEmail}</Text>
          {invoice.clientAddress ? (
            <Text style={styles.clientDetail}>{invoice.clientAddress}</Text>
          ) : null}
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

        <Text style={styles.footer}>Thank you for your business!</Text>
      </View>
    </Page>
  </Document>
);

export const PDFGenerator = (invoice: InvoiceData): Promise<Buffer> => {
  if (!invoice || !Array.isArray(invoice.items)) {
    return Promise.reject(new Error("Invoice items are required"));
  }
  return renderToBuffer(<InvoiceDocument invoice={invoice} />);
};
