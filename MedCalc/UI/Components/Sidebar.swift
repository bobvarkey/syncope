import SwiftUI

struct SidebarGroupSpec: Identifiable, Hashable {
    let id: String
    let title: String
    let systemImage: String
    let accent: SunsetAccent
    let items: [SidebarItem]
}

struct SidebarItem: Identifiable, Hashable {
    let id: String
    let title: String
    let systemImage: String
    let accent: SunsetAccent
    let route: SidebarRoute
}

enum SidebarRoute: Hashable {
    case tab(AppTab)
    case calculator(CalculatorKind)
}

@Observable
final class SidebarViewModel {
    var query: String = ""
    var openGroups: Set<String> {
        didSet { persist() }
    }

    let groups: [SidebarGroupSpec]

    init() {
        let stored = UserDefaults.standard.stringArray(forKey: Constants.Storage.sidebarGroups) ?? []
        self.openGroups = Set(stored)
        self.groups = [
            SidebarGroupSpec(
                id: "navigation", title: "Navigate", systemImage: "compass.drawing",
                accent: .coral,
                items: AppTab.allCases.map {
                    SidebarItem(id: "tab.\($0.rawValue)", title: $0.title,
                                systemImage: $0.systemImage, accent: .coral,
                                route: .tab($0))
                }),
            SidebarGroupSpec(
                id: "cardiology", title: "Cardiology", systemImage: "heart.fill",
                accent: .magenta,
                items: CalculatorKind.allCases.filter { $0.group == .cardiology }.map(Self.item))
        ]
    }

    private static func item(_ k: CalculatorKind) -> SidebarItem {
        SidebarItem(id: "calc.\(k.rawValue)", title: k.title,
                    systemImage: k.systemImage, accent: k.group.accent,
                    route: .calculator(k))
    }

    var hasQuery: Bool { !query.trimmingCharacters(in: .whitespaces).isEmpty }

    func toggle(_ groupID: String) {
        if openGroups.contains(groupID) { openGroups.remove(groupID) }
        else { openGroups.insert(groupID) }
    }

    func isOpen(_ groupID: String) -> Bool {
        if hasQuery { return groupMatches(groupID) }
        return openGroups.contains(groupID)
    }

    func groupMatches(_ id: String) -> Bool {
        guard let g = groups.first(where: { $0.id == id }) else { return false }
        let q = query.lowercased()
        return g.title.lowercased().contains(q) ||
               g.items.contains { $0.title.lowercased().contains(q) }
    }

    func filteredItems(for group: SidebarGroupSpec) -> [SidebarItem] {
        guard hasQuery else { return group.items }
        let q = query.lowercased()
        if group.title.lowercased().contains(q) { return group.items }
        return group.items.filter { $0.title.lowercased().contains(q) }
    }

    private func persist() {
        UserDefaults.standard.set(Array(openGroups), forKey: Constants.Storage.sidebarGroups)
    }
}

struct SidebarView: View {
    @Environment(AppState.self) private var appState
    @Bindable var vm: SidebarViewModel
    var onSelect: (SidebarRoute) -> Void

    var body: some View {
        VStack(spacing: DS.Spacing.m) {
            HStack {
                Image(systemName: "stethoscope")
                    .foregroundStyle(DS.sunset).font(.title2.weight(.bold))
                Text("MedCalc")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(DS.sunset)
                Spacer()
            }
            .padding(.horizontal, DS.Spacing.m)
            .padding(.top, DS.Spacing.l)

            searchField
                .padding(.horizontal, DS.Spacing.m)

            ScrollView {
                VStack(spacing: DS.Spacing.s) {
                    ForEach(vm.groups) { group in
                        if !vm.hasQuery || vm.groupMatches(group.id) {
                            groupSection(group)
                        }
                    }
                    if vm.hasQuery && vm.groups.allSatisfy({ !vm.groupMatches($0.id) }) {
                        emptyState
                    }
                }
                .padding(.horizontal, DS.Spacing.m)
                .padding(.bottom, DS.Spacing.xl)
            }
        }
        .frame(maxWidth: 320, maxHeight: .infinity, alignment: .leading)
        .background(.regularMaterial)
    }

    private var searchField: some View {
        HStack {
            Image(systemName: "magnifyingglass").foregroundStyle(.secondary)
            TextField("Search sections", text: $vm.query)
                .textInputAutocapitalization(.never)
                .font(.system(size: 16))
            if !vm.query.isEmpty {
                Button { vm.query = "" } label: {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(.secondary)
                }.buttonStyle(.plain)
            }
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    @ViewBuilder
    private func groupSection(_ group: SidebarGroupSpec) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Button {
                withAnimation(.snappy) { vm.toggle(group.id) }
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: group.systemImage)
                        .font(.body.weight(.semibold))
                        .foregroundStyle(group.accent.color)
                    HighlightedText(text: group.title, query: vm.query)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.primary)
                    Spacer()
                    Image(systemName: vm.isOpen(group.id) ? "chevron.down" : "chevron.right")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.secondary)
                }
                .contentShape(Rectangle())
                .padding(.vertical, 8)
            }
            .buttonStyle(.plain)

            if vm.isOpen(group.id) {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(vm.filteredItems(for: group)) { item in
                        Button {
                            onSelect(item.route)
                        } label: {
                            HStack(spacing: 10) {
                                Image(systemName: item.systemImage)
                                    .foregroundStyle(item.accent.color)
                                    .frame(width: 22)
                                HighlightedText(text: item.title, query: vm.query)
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundStyle(.primary)
                                Spacer()
                            }
                            .padding(.vertical, 8)
                            .padding(.horizontal, 10)
                            .background(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .fill(item.accent.color.opacity(0.08))
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.leading, 6)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: "sparkle.magnifyingglass")
                .font(.largeTitle).foregroundStyle(DS.sunset)
            Text("No sections match “\(vm.query)”")
                .font(.subheadline).foregroundStyle(.secondary)
        }
        .padding(.top, DS.Spacing.xl)
    }
}
