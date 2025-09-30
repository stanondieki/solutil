// TypeScript interfaces for the admin providers page
export interface ProviderDocument {
  uploaded: Date | null
  verified: boolean
  url?: string
  public_id?: string
}

export interface ProviderProfile {
  services?: string[]
  skills?: string[]
  location?: string
  experience?: string
  hourlyRate?: number
  rating?: number
  completedJobs?: number
  bio?: string
  availability?: {
    days: string[]
    hours: { start: string; end: string }
  }
  serviceAreas?: string[]
}

export interface ProviderAddress {
  city?: string
  country?: string
  street?: string
  state?: string
}

export interface ProviderDocuments {
  nationalId?: ProviderDocument
  businessLicense?: ProviderDocument
  certificate?: ProviderDocument
  goodConductCertificate?: ProviderDocument
  portfolio?: ProviderDocument[]
}

export interface ProviderVerification {
  idVerified?: boolean
  businessVerified?: boolean
  certificateVerified?: boolean
  goodConductVerified?: boolean
  phoneVerified?: boolean
  emailVerified?: boolean
}

export interface RawProvider {
  _id: string
  name: string
  email: string
  phone: string
  userType: string
  providerProfile?: ProviderProfile
  address?: ProviderAddress
  providerStatus?: string
  createdAt?: string
  isVerified?: boolean
  providerDocuments?: ProviderDocuments
}

export interface ServiceProvider {
  id: string
  name: string
  email: string
  phone: string
  services: string[]
  rating: number
  totalJobs: number
  status: 'pending' | 'approved' | 'suspended' | 'under_review' | 'rejected'
  joinDate: string
  location: string
  experience: string
  hourlyRate: number
  bio: string
  availability: {
    days: string[]
    hours: { start: string; end: string }
  }
  serviceAreas: string[]
  documents: {
    nationalId: ProviderDocument
    businessLicense: ProviderDocument
    certificate: ProviderDocument
    goodConductCertificate: ProviderDocument
  }
  verification: ProviderVerification
}