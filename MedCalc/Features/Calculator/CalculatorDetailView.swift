import SwiftUI
import SwiftData

@Observable
final class CalculatorViewModel {
    let kind: CalculatorKind
    var inputs: [String: String] = [:]
    var result: CalculationResult?
    var error: String?
    var showInterpretation: Bool = false

    init(kind: CalculatorKind) { self.kind = kind }

    var fields: [InputField] {
        switch kind {
        case .bmi:
            [.init(key: "weightKg", label: "Weight", unit: "kg"),
             .init(key: "heightCm", label: "Height", unit: "cm")]
        case .map:
            [.init(key: "sbp", label: "SBP", unit: "mmHg"),
             .init(key: "dbp", label: "DBP", unit: "mmHg")]
        case .gfrCockcroftGault:
            [.init(key: "age", label: "Age", unit: "yr"),
             .init(key: "weightKg", label: "Weight", unit: "kg"),
             .init(key: "creatinineMgDl", label: "Creatinine", unit: "mg/dL"),
             .init(key: "isFemale", label: "Female (1/0)", unit: "")]
        case .correctedCalcium:
            [.init(key: "calciumMgDl", label: "Calcium", unit: "mg/dL"),
             .init(key: "albuminGdl", label: "Albumin", unit: "g/dL")]
        case .aniongap:
            [.init(key: "sodium", label: "Na⁺", unit: "mEq/L"),
             .init(key: "chloride", label: "Cl⁻", unit: "mEq/L"),
             .init(key: "bicarb", label: "HCO₃⁻", unit: "mEq/L")]
        case .qtc:
            [.init(key: "qtMs", label: "QT", unit: "ms"),
             .init(key: "rrSec", label: "RR", unit: "s")]
        }
    }

    func compute(using service: CalculatorServicing, context: ModelContext, haptics: HapticsServicing) {
        do {
            let parsed = inputs.compactMapValues { Double($0.replacingOccurrences(of: ",", with: ".")) }
            let r = try service.compute(kind: kind, inputs: parsed)
            withAnimation(.snappy) {
                self.result = r
                self.error = nil
            }
            haptics.success()
            let record = CalculationRecord(kind: kind, inputs: parsed, result: r)
            context.insert(record)
        } catch let err as AppError {
            self.error = err.errorDescription
            haptics.warning()
        } catch {
            self.error = "Unexpected error"
            haptics.warning()
        }
    }
}

struct InputField: Identifiable, Hashable {
    let key: String; let label: String; let unit: String
    var id: String { key }
}

struct CalculatorDetailView: View {
    let kind: CalculatorKind
    @Environment(DIContainer.self) private var di
    @Environment(\.modelContext) private var modelContext
    @State private var vm: CalculatorViewModel

    init(kind: CalculatorKind) {
        self.kind = kind
        _vm = State(initialValue: CalculatorViewModel(kind: kind))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Spacing.l) {
                header

                GlassCard {
                    VStack(spacing: DS.Spacing.m) {
                        ForEach(vm.fields) { f in
                            HStack {
                                Text(f.label).font(.system(size: 16, weight: .medium))
                                Spacer()
                                TextField("—", text: Binding(
                                    get: { vm.inputs[f.key] ?? "" },
                                    set: { vm.inputs[f.key] = $0 }))
                                    .keyboardType(.decimalPad)
                                    .multilineTextAlignment(.trailing)
                                    .frame(maxWidth: 120)
                                Text(f.unit).foregroundStyle(.secondary).frame(width: 56, alignment: .leading)
                            }
                        }
                    }
                }

                Button {
                    vm.compute(using: di.calculatorService, context: modelContext, haptics: di.hapticsService)
                } label: {
                    Label("Calculate", systemImage: "sparkles")
                }
                .buttonStyle(SunsetButtonStyle())

                if let error = vm.error {
                    Text(error).font(.callout).foregroundStyle(.red)
                }

                if let r = vm.result {
                    resultCard(r)
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                }

                DisclaimerBanner()

                Button {
                    // Back-to-top handled by ScrollViewReader in production; simple hint here.
                } label: {
                    Label("Back to top", systemImage: "arrow.up")
                        .font(.footnote.weight(.semibold))
                }
                .buttonStyle(.bordered)
                .tint(DS.Color.violet)
            }
            .padding(DS.Spacing.m)
        }
        .navigationTitle(kind.title)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var header: some View {
        UniformMedia(aspect: 21.0/9.0) {
            ZStack {
                DS.sunset
                Image(systemName: kind.systemImage)
                    .font(.system(size: 64, weight: .bold))
                    .foregroundStyle(.white.opacity(0.9))
                    .shadow(radius: 8)
            }
        }
    }

    private func resultCard(_ r: CalculationResult) -> some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 10) {
                Text("Result").font(.footnote.weight(.semibold)).foregroundStyle(.secondary)
                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text("\(r.value.formatted(.number.precision(.fractionLength(0...2))))")
                        .font(.system(size: 44, weight: .bold, design: .rounded))
                        .foregroundStyle(DS.sunset)
                    Text(r.unit).font(.title3).foregroundStyle(.secondary)
                }
                DisclosureGroup(isExpanded: Binding(
                    get: { vm.showInterpretation }, set: { vm.showInterpretation = $0 })
                ) {
                    Text(r.interpretation)
                        .font(.callout).foregroundStyle(.primary)
                        .padding(.top, 6)
                } label: {
                    Label("Interpretation (optional)", systemImage: "text.bubble")
                        .font(.subheadline.weight(.semibold))
                }
            }
        }
    }
}
