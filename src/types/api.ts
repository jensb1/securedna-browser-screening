// Complete TypeScript interfaces for SecureDNA API Response

export type SynthesisPermission = 'granted' | 'denied'

export type HitType = 'nuc' | 'aa'

export type OrganismType = 'Virus' | 'Toxin' | 'Bacterium' | 'Fungus'

export type Tag =
  // Transmission pathways
  | 'ArthropodToHuman'
  | 'HumanToHuman'
  // Risk categorization
  | 'PotentialPandemicPathogen'
  // Regulatory lists
  | 'AustraliaGroupHumanAnimalPathogen'
  | 'AustraliaGroupPlantPathogen'
  | 'EuropeanUnion'
  | 'PRCExportControlPart1'
  | 'PRCExportControlPart2'
  | 'SelectAgentHhs'
  | 'SelectAgentUsda'
  | 'SelectAgentAphis'
  // Other classifications
  | 'Common'
  | 'RegulatedButPass'

export interface HitRegion {
  seq: string
  seq_range_start: number
  seq_range_end: number
}

export interface HitOrganism {
  name: string
  organism_type: OrganismType
  ans: string[]
  tags: Tag[]
}

export interface HazardHits {
  type: HitType
  is_wild_type: boolean | null
  hit_regions: HitRegion[]
  most_likely_organism: HitOrganism
  organisms: HitOrganism[]
}

export interface FastaRecordHits {
  fasta_header: string
  line_number_range: [number, number]
  sequence_length: number
  hits_by_hazard: HazardHits[]
}

export interface ApiWarningFields {
  additional_info: string
  line_number_range?: [number, number]
}

export interface ApiErrorFields {
  additional_info: string
  line_number_range?: [number, number]
}

export type ApiWarning =
  | { diagnostic: 'certificate_expiring_soon' } & ApiWarningFields
  | { diagnostic: 'too_short' } & ApiWarningFields
  | { diagnostic: 'too_ambiguous' } & ApiWarningFields

export type ApiError =
  | { diagnostic: 'not_found' } & ApiErrorFields
  | { diagnostic: 'internal_server_error' } & ApiErrorFields
  | { diagnostic: 'unauthorized' } & ApiErrorFields
  | { diagnostic: 'invalid_input' } & ApiErrorFields
  | { diagnostic: 'request_too_big' } & ApiErrorFields
  | { diagnostic: 'too_many_requests' } & ApiErrorFields

export type SequenceProvenance =
  | 'DnaNormal'
  | 'DnaRunt'
  | 'AAWildType'
  | 'AASingleReplacement'
  | 'AADoubleReplacement'
  | 'AASampled'

export interface DebugHit {
  seq: string
  index: number
  most_likely_organism: HitOrganism
  organisms: HitOrganism[]
  an_likelihood: number
  provenance: SequenceProvenance
  reverse_screened: boolean
  window_gap: number
}

export interface DebugFastaRecordHits {
  fasta_header: string
  line_number_range: [number, number]
  sequence_length: number
  hits: DebugHit[]
}

export interface DebugInfo {
  grouped_hits: DebugFastaRecordHits[]
}

export interface VerifiableApiResponse {
  synthclient_version: string
  response_json: string
  signature: string
  public_key: string
  history: string
  sha3_256: string
}

export interface ApiResponse {
  synthesis_permission: SynthesisPermission
  provider_reference?: string
  hits_by_record: FastaRecordHits[]
  verifiable?: VerifiableApiResponse
  warnings: ApiWarning[]
  errors: ApiError[]
  debug_info?: DebugInfo
}

// Helper functions for tag classification
export const getTagColor = (tag: Tag): string => {
  // Transmission risk - Red/Orange
  if (tag === 'HumanToHuman' || tag === 'PotentialPandemicPathogen') {
    return 'bg-red-100 text-red-800 border-red-300'
  }
  if (tag === 'ArthropodToHuman') {
    return 'bg-orange-100 text-orange-800 border-orange-300'
  }

  // Regulatory - Purple/Blue
  if (tag === 'SelectAgentHhs' || tag === 'SelectAgentUsda' || tag === 'SelectAgentAphis') {
    return 'bg-purple-100 text-purple-800 border-purple-300'
  }
  if (tag === 'AustraliaGroupHumanAnimalPathogen' || tag === 'AustraliaGroupPlantPathogen' ||
      tag === 'EuropeanUnion' || tag === 'PRCExportControlPart1' || tag === 'PRCExportControlPart2') {
    return 'bg-blue-100 text-blue-800 border-blue-300'
  }

  // Low risk - Green
  if (tag === 'Common' || tag === 'RegulatedButPass') {
    return 'bg-green-100 text-green-800 border-green-300'
  }

  // Default
  return 'bg-gray-100 text-gray-800 border-gray-300'
}

export const getTagLabel = (tag: Tag): string => {
  const labels: Record<Tag, string> = {
    'ArthropodToHuman': 'Arthropod → Human',
    'HumanToHuman': 'Human → Human',
    'PotentialPandemicPathogen': 'Pandemic Potential',
    'AustraliaGroupHumanAnimalPathogen': 'Australia Group (Human/Animal)',
    'AustraliaGroupPlantPathogen': 'Australia Group (Plant)',
    'EuropeanUnion': 'EU Regulated',
    'PRCExportControlPart1': 'PRC Export Control (Part 1)',
    'PRCExportControlPart2': 'PRC Export Control (Part 2)',
    'SelectAgentHhs': 'Select Agent (HHS)',
    'SelectAgentUsda': 'Select Agent (USDA)',
    'SelectAgentAphis': 'Select Agent (APHIS)',
    'Common': 'Common',
    'RegulatedButPass': 'Regulated (Pass)',
  }
  return labels[tag] || tag
}

export const getOrganismTypeColor = (type: OrganismType): string => {
  const colors: Record<OrganismType, string> = {
    'Virus': 'bg-red-50 text-red-700 border-red-200',
    'Toxin': 'bg-purple-50 text-purple-700 border-purple-200',
    'Bacterium': 'bg-blue-50 text-blue-700 border-blue-200',
    'Fungus': 'bg-green-50 text-green-700 border-green-200',
  }
  return colors[type]
}

export const getOrganismTypeIcon = (type: OrganismType): string => {
  const icons: Record<OrganismType, string> = {
    'Virus': '🦠',
    'Toxin': '☠️',
    'Bacterium': '🔬',
    'Fungus': '🍄',
  }
  return icons[type]
}
