import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X, Info } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import type { ValidationIssue } from '../../types/nodes';

function IssueRow({ issue }: { issue: ValidationIssue }) {
  return (
    <div
      className={`flex items-start gap-2 px-2 py-1.5 rounded text-xs ${
        issue.severity === 'error'
          ? 'bg-red-50 text-red-800'
          : 'bg-amber-50 text-amber-800'
      }`}
    >
      {issue.severity === 'error' ? (
        <XCircle size={11} className="mt-0.5 flex-shrink-0" />
      ) : (
        <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" />
      )}
      <span>{issue.message}</span>
    </div>
  );
}

export function ValidationStatus() {
  const validationResult = useProjectStore((s) => s.validationResult);
  const [open, setOpen] = useState(false);

  if (!validationResult) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
        <Info size={12} />
        Belum divalidasi
      </div>
    );
  }

  const errors = validationResult.issues.filter((i) => i.severity === 'error');
  const warnings = validationResult.issues.filter((i) => i.severity === 'warning');

  const badgeClass = validationResult.valid
    ? warnings.length > 0
      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      : 'bg-green-100 text-green-700 hover:bg-green-200'
    : 'bg-red-100 text-red-700 hover:bg-red-200';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${badgeClass}`}
        title="Klik untuk lihat detail validasi"
      >
        {validationResult.valid ? (
          <>
            <CheckCircle size={13} />
            Neraca Valid
            {warnings.length > 0 && (
              <span className="ml-1 opacity-80">({warnings.length} peringatan)</span>
            )}
          </>
        ) : (
          <>
            <XCircle size={13} />
            {errors.length} Error
            {warnings.length > 0 && (
              <span className="ml-1 opacity-80">+ {warnings.length} Peringatan</span>
            )}
          </>
        )}
      </button>

      {open && (
        <>
          {/* Overlay untuk close saat klik luar */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1.5 z-50 w-96 bg-white rounded-lg shadow-xl border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
              <span className="text-sm font-semibold">Hasil Validasi Neraca Air</span>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3">
              {validationResult.issues.length === 0 ? (
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle size={16} />
                  Semua validasi lulus - neraca siap di-export
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {errors.length > 0 && (
                    <p className="text-xs font-semibold text-red-700 mb-1">
                      Error ({errors.length})
                    </p>
                  )}
                  {errors.map((issue, i) => (
                    <IssueRow key={`e-${i}`} issue={issue} />
                  ))}

                  {warnings.length > 0 && (
                    <p className="text-xs font-semibold text-amber-700 mt-2 mb-1">
                      Peringatan ({warnings.length})
                    </p>
                  )}
                  {warnings.map((issue, i) => (
                    <IssueRow key={`w-${i}`} issue={issue} />
                  ))}
                </div>
              )}
            </div>

            <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
              Validasi otomatis berjalan setiap kali diagram berubah
            </div>
          </div>
        </>
      )}
    </div>
  );
}
