import React, { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  XCircle,
  FileText,
  Activity,
  Download,
  Layers,
  List
} from 'lucide-react'
import type {
  ApiResponse,
  FastaRecordHits,
  HazardHits,
  HitOrganism,
  ApiWarning,
  ApiError
} from '../types/api'
import {
  getTagColor,
  getTagLabel,
  getOrganismTypeColor,
  getOrganismTypeIcon
} from '../types/api'

type ViewMode = 'structured' | 'summary'

interface ScreeningResultsProps {
  result: ApiResponse
}

export default function ScreeningResults({ result }: ScreeningResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('summary')
  const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set([0]))
  const [expandedHazards, setExpandedHazards] = useState<Set<string>>(new Set())

  const toggleRecord = (index: number) => {
    const newExpanded = new Set(expandedRecords)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRecords(newExpanded)
  }

  const toggleHazard = (key: string) => {
    const newExpanded = new Set(expandedHazards)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedHazards(newExpanded)
  }

  const totalHits = result.hits_by_record.reduce(
    (sum, record) => sum + record.hits_by_hazard.length,
    0
  )

  const uniqueOrganisms = new Set(
    result.hits_by_record.flatMap(record =>
      record.hits_by_hazard.map(hazard => hazard.most_likely_organism.name)
    )
  )

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `securedna-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Top-Level Status */}
      <div className={`rounded-lg shadow-md p-6 border-2 ${
        result.synthesis_permission === 'granted'
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            {result.synthesis_permission === 'granted' ? (
              <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
            )}
            <div>
              <h3 className={`text-2xl font-bold mb-1 ${
                result.synthesis_permission === 'granted' ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.synthesis_permission === 'granted' ? 'Synthesis Granted' : 'Synthesis Denied'}
              </h3>
              <p className={`text-sm ${
                result.synthesis_permission === 'granted' ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.synthesis_permission === 'granted'
                  ? 'No hazardous sequences detected'
                  : 'Hazardous sequences detected in submission'}
              </p>
              {result.provider_reference && (
                <p className="text-xs mt-2 text-gray-600">
                  Reference: {result.provider_reference}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Download JSON
          </button>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((warning, idx) => (
            <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {warning.diagnostic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">{warning.additional_info}</p>
                  {warning.line_number_range && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Lines {warning.line_number_range[0]}-{warning.line_number_range[1]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {result.errors && result.errors.length > 0 && (
        <div className="space-y-2">
          {result.errors.map((error, idx) => (
            <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">
                    {error.diagnostic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-red-700 mt-1">{error.additional_info}</p>
                  {error.line_number_range && (
                    <p className="text-xs text-red-600 mt-1">
                      Lines {error.line_number_range[0]}-{error.line_number_range[1]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      {result.hits_by_record.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FileText className="h-4 w-4" />
              <p className="text-sm font-medium">Records Screened</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{result.hits_by_record.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">Hazard Hits</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalHits}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Activity className="h-4 w-4" />
              <p className="text-sm font-medium">Unique Organisms</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{uniqueOrganisms.size}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FileText className="h-4 w-4" />
              <p className="text-sm font-medium">Total Base Pairs</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {result.hits_by_record.reduce((sum, r) => sum + r.sequence_length, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      {result.hits_by_record.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Results</h3>

            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('summary')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'summary'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <List className="h-4 w-4" />
                Summary
              </button>
              <button
                onClick={() => setViewMode('structured')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'structured'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Layers className="h-4 w-4" />
                Structured
              </button>
            </div>
          </div>

          {/* View Mode Description */}
          <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            {viewMode === 'summary' ? (
              <span>📋 <strong>Summary View:</strong> Shows deduplicated organisms with primary and alternative matches</span>
            ) : (
              <span>🔬 <strong>Structured View:</strong> Shows all organisms exactly as returned by API, with duplicate detection badges. Expand a hazard to see details.</span>
            )}
          </div>
        </div>
      )}

      {/* Detailed Results by Record */}
      {result.hits_by_record.length > 0 && (
        <div className="space-y-4">
          {result.hits_by_record.map((record, recordIdx) => (
            <RecordDetails
              key={recordIdx}
              record={record}
              recordIdx={recordIdx}
              isExpanded={expandedRecords.has(recordIdx)}
              onToggle={() => toggleRecord(recordIdx)}
              expandedHazards={expandedHazards}
              onToggleHazard={toggleHazard}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface RecordDetailsProps {
  record: FastaRecordHits
  recordIdx: number
  isExpanded: boolean
  onToggle: () => void
  expandedHazards: Set<string>
  onToggleHazard: (key: string) => void
  viewMode: ViewMode
}

function RecordDetails({
  record,
  recordIdx,
  isExpanded,
  onToggle,
  expandedHazards,
  onToggleHazard,
  viewMode
}: RecordDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Record Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          )}
          <FileText className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">
              {record.fasta_header || `Record ${recordIdx + 1}`}
            </h4>
            <p className="text-sm text-gray-600">
              Lines {record.line_number_range[0]}-{record.line_number_range[1]} • {' '}
              {record.sequence_length.toLocaleString()} bp • {' '}
              {record.hits_by_hazard.length} hazard{record.hits_by_hazard.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {record.hits_by_hazard.length > 0 && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            ⚠️ {record.hits_by_hazard.length} Hit{record.hits_by_hazard.length !== 1 ? 's' : ''}
          </div>
        )}
      </button>

      {/* Record Details */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {record.hits_by_hazard.map((hazard, hazardIdx) => {
            const hazardKey = `${recordIdx}-${hazardIdx}`
            return (
              <HazardDetails
                key={hazardKey}
                hazard={hazard}
                hazardKey={hazardKey}
                isExpanded={expandedHazards.has(hazardKey)}
                onToggle={() => onToggleHazard(hazardKey)}
                viewMode={viewMode}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

interface HazardDetailsProps {
  hazard: HazardHits
  hazardKey: string
  isExpanded: boolean
  onToggle: () => void
  viewMode: ViewMode
}

function HazardDetails({ hazard, hazardKey, isExpanded, onToggle, viewMode }: HazardDetailsProps) {
  const org = hazard.most_likely_organism
  const [showHitRegions, setShowHitRegions] = React.useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Hazard Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 bg-gray-50"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getOrganismTypeIcon(org.organism_type)}</span>
              <span className="font-semibold text-gray-900">{org.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded border ${getOrganismTypeColor(org.organism_type)}`}>
                {org.organism_type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border ${
                hazard.type === 'nuc' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-purple-100 text-purple-800 border-purple-300'
              }`}>
                {hazard.type === 'nuc' ? 'DNA' : 'Protein'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {hazard.hit_regions.length} region{hazard.hit_regions.length !== 1 ? 's' : ''} ({
                hazard.hit_regions.reduce((sum, r) => sum + (r.seq_range_end - r.seq_range_start), 0)
              } bp total)
            </p>
          </div>
        </div>
      </button>

      {/* Hazard Details */}
      {isExpanded && (
        <div className="px-4 py-4 space-y-4 bg-white">
          {viewMode === 'structured' ? (
            <StructuredOrganismView hazard={hazard} />
          ) : (
            <SummaryOrganismView hazard={hazard} />
          )}

          {/* Hit Regions */}
          <div>
            <button
              onClick={() => setShowHitRegions(!showHitRegions)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-gray-900 mb-2"
            >
              <span>Hit Regions ({hazard.hit_regions.length})</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showHitRegions ? 'transform rotate-180' : ''}`}
              />
            </button>
            {showHitRegions && (
              <div className="space-y-2">
                {hazard.hit_regions.map((region, idx) => (
                  <HitRegionDisplay key={idx} region={region} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface OrganismViewProps {
  hazard: HazardHits
}

// STRUCTURED VIEW: Shows all organisms from API
function StructuredOrganismView({ hazard }: OrganismViewProps) {
  const mostLikelyName = hazard.most_likely_organism.name

  return (
    <div className="space-y-4">
      {/* Most Likely Organism */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Most Likely Organism</h5>
        <OrganismCard organism={hazard.most_likely_organism} isPrimary={true} />
      </div>

      {/* All Organisms from API */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-2">
          All Organisms from API ({hazard.organisms.length})
        </h5>
        <div className="space-y-2">
          {hazard.organisms.map((org, idx) => {
            const isDuplicate = org.name === mostLikelyName
            const hasDifferences = isDuplicate && JSON.stringify(org) !== JSON.stringify(hazard.most_likely_organism)

            return (
              <div key={idx} className="relative">
                <OrganismCard organism={org} isPrimary={false} showIndex={idx + 1} />
                {isDuplicate && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded border border-orange-300 font-medium">
                      📊 Also most likely
                    </span>
                    {hasDifferences && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-300 font-medium">
                        ⚠️ Has differences
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// SUMMARY VIEW: Deduplicates and simplifies
function SummaryOrganismView({ hazard }: OrganismViewProps) {
  const alternativeOrganisms = hazard.organisms.filter(
    org => org.name !== hazard.most_likely_organism.name
  )

  return (
    <div className="space-y-4">
      {/* Primary Organism */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Primary Match</h5>
        <OrganismCard organism={hazard.most_likely_organism} isPrimary={true} />
      </div>

      {/* Alternative Organisms */}
      {alternativeOrganisms.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">
            Alternative Matches ({alternativeOrganisms.length})
          </h5>
          <div className="space-y-2">
            {alternativeOrganisms.map((altOrg, idx) => (
              <OrganismCard key={idx} organism={altOrg} isPrimary={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface OrganismCardProps {
  organism: HitOrganism
  isPrimary: boolean
  showIndex?: number
}

function OrganismCard({ organism, isPrimary, showIndex }: OrganismCardProps) {
  return (
    <div className={`p-3 rounded-lg border ${
      isPrimary ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {showIndex && (
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-300">
                #{showIndex}
              </span>
            )}
            <span className="text-base">{getOrganismTypeIcon(organism.organism_type)}</span>
            <span className="font-semibold text-gray-900">{organism.name}</span>
            {isPrimary && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                Most Likely
              </span>
            )}
          </div>

          {organism.ans.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-600 mb-1">Accession Numbers:</p>
              <div className="flex flex-wrap gap-1">
                {organism.ans.map((an, idx) => (
                  <code key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                    {an}
                  </code>
                ))}
              </div>
            </div>
          )}

          {organism.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Classification ({organism.tags.length}):</p>
              <div className="flex flex-wrap gap-1">
                {organism.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-0.5 rounded border font-medium ${getTagColor(tag)}`}
                  >
                    {getTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface HitRegionDisplayProps {
  region: {
    seq: string
    seq_range_start: number
    seq_range_end: number
  }
}

function HitRegionDisplay({ region }: HitRegionDisplayProps) {
  const length = region.seq_range_end - region.seq_range_start

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">
          Position {region.seq_range_start}-{region.seq_range_end}
        </p>
        <span className="text-xs text-gray-600">{length} bp</span>
      </div>
      <div className="bg-white border border-gray-300 rounded p-2 font-mono text-xs break-all">
        <div className="text-gray-600 mb-1">Matched Sequence:</div>
        <div className="text-red-700 font-semibold">{region.seq}</div>
      </div>
    </div>
  )
}
