export class UserToken {
    userId ?: string;
    userName ?: string;
    displayName ?: string;
    tenantId ?: string;
    permissions ?: string[];
    marketingEntityKeys ?: number[];
    preapprovalAllowed ?: string;
    brandingAllowed ?: string;
    dateFormat ?: string;
    dateTimeFormat ?: string;
    programGuidelineFileFormat ?: string;
    accrualFileFormat ?: string;
    CoopFundingAllowedFileFormats ?: string;
    MdfFundingAllowedFileFormats ?: string;
    claimSupportDocFileFormat ?: string;
    brandingSupportDocFileFormat ?: string;
    fundrequestSupportDocFileFormat ?: string;
    programType ?: string;
    ProgramGuidelinesFileFormat ?: string;
    ClaimReviewSla ?: number;
    ClaimRequestInfoSla ?: number;
    CoopBrandingReviewSla ?: number;
    CoopFundingReviewSla ?: number;
    CoopFundingRequestInfoSla ?: number;
    MdfFundingReviewSla ?: number;
    MdfFundingRequestInfoSla ?: number;
    DisbursementExcelField ?: string;
    businessUnitId ?: string;
    theme ?: string;
    locale ?: string;
    creditMemoDateFormat ?: string;
    startDateLimit ?: number;
    endDateLimit ?: number;
    isInternal ?: string;
    expiry : number=0;
    quicklinks ?: string;
    Attachments ?: string;
    PrimeNgDateFormat ?: string;
    TimeFormat ?: string;
    AutoClaimColumnName: any;
    PaymentTypes: string[] = [];
    MaxDateLimit = 0;
    CustomClaimObject ?:string;
    ClaimInvoiceFields: string[] = [];
    ClaimInvoiceIdConfig: any;
    ClaimInvoiceDateConfig: any;
    ClaimMultiInvoiceAllowed: any;
    ShowLMEType ?: string;

    /* constructor(userId: string, userName: string, displayName: string, tenantId: string, permissions: string[],
        role: string, marketingEntityKeys: number[]) {
            this.userId = userId;
            this.userName = userName;
            this.displayName = displayName;
            this.tenantId = tenantId;
            this.permissions = permissions;
            this.marketingEntityKeys = marketingEntityKeys;
        } */

    /* constructor() {
        this.userId = null;
        this.userName = null;
        this.firstName = null;
        this.lastName = null;
        this.tenantId = null;
        this.permissions = null;
        this.marketingEntityKeys = null;
        this.preapprovalAllowed = null;
    } */
}
