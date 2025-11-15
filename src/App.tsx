import React, { useState, useEffect } from 'react'
import { Shield, FileText, Key, Server, Loader2, Activity, Save, Download, AlertCircle } from 'lucide-react'
import './index.css'
import ScreeningResults from './components/ScreeningResults'
import type { ApiResponse } from './types/api'

// WASM types
type ScreenConfig = {
  region: string
  enumeration_settings: null
  fixed_domains: {
    keyserver_domains: string[]
    hdb_domains: string[]
  }
  include_debug_info: boolean
  request_id: string
  use_http: boolean
  token_contents: number[]
  keypair_contents: number[]
  keypair_passphrase: string
}

function App() {
  const [wasmModule, setWasmModule] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [sequence, setSequence] = useState('')
  const [token, setToken] = useState('')
  const [keypair, setKeypair] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [keyservers, setKeyservers] = useState('1.ks.prod.securedna.org,2.ks.prod.securedna.org,3.ks.prod.securedna.org')
  const [hdb, setHdb] = useState('1.db.prod.securedna.org')
  const [saveToStorage, setSaveToStorage] = useState(false)
  const [loadedFromStorage, setLoadedFromStorage] = useState(false)

  // Load WASM module
  useEffect(() => {
    async function loadWasm() {
      try {
        const module = await import('./wasm/screening_wasm.js')
        await module.default()
        setWasmModule(module)
      } catch (err) {
        setError(`Failed to load WASM: ${err}`)
      }
    }
    loadWasm()
  }, [])

  // Load credentials from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('securedna_token')
      const savedKeypair = localStorage.getItem('securedna_keypair')
      const savedPassphrase = localStorage.getItem('securedna_passphrase')
      const savedKeyservers = localStorage.getItem('securedna_keyservers')
      const savedHdb = localStorage.getItem('securedna_hdb')

      console.log('Loading from localStorage:', {
        hasToken: !!savedToken,
        tokenLength: savedToken?.length,
        hasKeypair: !!savedKeypair,
        keypairLength: savedKeypair?.length,
        hasPassphrase: !!savedPassphrase
      })

      if (savedToken || savedKeypair || savedPassphrase) {
        if (savedToken) setToken(savedToken)
        if (savedKeypair) setKeypair(savedKeypair)
        if (savedPassphrase) setPassphrase(savedPassphrase)
        if (savedKeyservers) setKeyservers(savedKeyservers)
        if (savedHdb) setHdb(savedHdb)
        setSaveToStorage(true)
        setLoadedFromStorage(true)
        console.log('Credentials restored from localStorage')
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err)
    }
  }, [])

  // Save/clear credentials from localStorage when toggle changes
  useEffect(() => {
    if (saveToStorage) {
      try {
        localStorage.setItem('securedna_token', token)
        localStorage.setItem('securedna_keypair', keypair)
        localStorage.setItem('securedna_passphrase', passphrase)
        localStorage.setItem('securedna_keyservers', keyservers)
        localStorage.setItem('securedna_hdb', hdb)
      } catch (err) {
        console.error('Failed to save to localStorage:', err)
        setError('Failed to save credentials to browser storage')
      }
    } else {
      try {
        localStorage.removeItem('securedna_token')
        localStorage.removeItem('securedna_keypair')
        localStorage.removeItem('securedna_passphrase')
        localStorage.removeItem('securedna_keyservers')
        localStorage.removeItem('securedna_hdb')
        setLoadedFromStorage(false)
      } catch (err) {
        console.error('Failed to clear localStorage:', err)
      }
    }
  }, [saveToStorage, token, keypair, passphrase, keyservers, hdb])

  const handleFileUpload = async (file: File, setter: (value: string) => void) => {
    const text = await file.text()
    setter(text)
  }

  const handleScreen = async () => {
    if (!wasmModule) {
      setError('WASM module not loaded')
      return
    }

    // Check which fields are missing
    const missing = []
    if (!sequence) missing.push('DNA Sequence')
    if (!token) missing.push('Token File')
    if (!keypair) missing.push('Keypair File')
    if (!passphrase) missing.push('Passphrase')

    if (missing.length > 0) {
      setError(`Please provide: ${missing.join(', ')}`)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const config: ScreenConfig = {
        region: 'All',
        enumeration_settings: null,
        fixed_domains: {
          keyserver_domains: keyservers.split(',').map(s => s.trim()),
          hdb_domains: [hdb.trim()]
        },
        include_debug_info: true,
        request_id: `webapp_${Date.now()}`,
        use_http: false,
        token_contents: Array.from(new TextEncoder().encode(token)),
        keypair_contents: Array.from(new TextEncoder().encode(keypair)),
        keypair_passphrase: passphrase
      }

      const response = await wasmModule.screen(sequence, config)
      setResult(response)
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SecureDNA Screening</h1>
              <p className="text-sm text-gray-600">Privacy-preserving DNA synthesis screening</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Sequence Input */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">DNA Sequence</h2>
              </div>
              <textarea
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter DNA sequence (ATCG) or paste FASTA format..."
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                Length: {sequence.replace(/[^ATCG]/gi, '').length} bp
              </p>
            </div>

            {/* Credentials */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Credentials</h2>
                </div>
                <button
                  onClick={() => setSaveToStorage(!saveToStorage)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    saveToStorage
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  {saveToStorage ? 'Saved in Browser' : 'Save in Browser'}
                </button>
              </div>

              {/* Loaded from storage indicator */}
              {loadedFromStorage && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <Download className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Credentials loaded from browser storage</p>
                    <p className="text-xs text-blue-600 mt-1">Your saved credentials were automatically restored</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <span>Token File (.st)</span>
                    {token && (
                      <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                        ✓ Loaded ({token.length} chars)
                      </span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept=".st"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setToken)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <span>Keypair File (.priv)</span>
                    {keypair && (
                      <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                        ✓ Loaded ({keypair.length} chars)
                      </span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept=".priv"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setKeypair)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <span>Passphrase</span>
                    {passphrase && (
                      <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                        ✓ Set
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter passphrase..."
                  />
                </div>
              </div>
            </div>

            {/* Server Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Server Configuration</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keyservers (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={keyservers}
                    onChange={(e) => setKeyservers(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HDB Server
                  </label>
                  <input
                    type="text"
                    value={hdb}
                    onChange={(e) => setHdb(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Screen Button */}
            <button
              onClick={handleScreen}
              disabled={loading || !wasmModule}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Screening...
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5" />
                  Screen Sequence
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Status */}
            {!result && !error && !loading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">Ready to Screen</h3>
                <p className="text-sm text-gray-400 mt-2">Enter your sequence and credentials to begin</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-700">Screening in progress...</h3>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow-md p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                    <p className="text-sm text-red-700 font-mono whitespace-pre-wrap">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Result */}
            {result && <ScreeningResults result={result} />}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">About SecureDNA Screening</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Privacy-preserving cryptographic screening</li>
                <li>• Distributed keyserver architecture</li>
                <li>• No plaintext DNA sequence leaves your browser</li>
                <li>• Fixed performance improvements applied</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
