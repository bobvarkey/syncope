import SwiftUI

struct MainShellView: View {
    @Environment(AppState.self) private var appState
    @Environment(DIContainer.self) private var di
    @State private var sidebar = SidebarViewModel()
    @State private var selectedTab: AppTab = .home
    @State private var path = NavigationPath()

    var body: some View {
        ZStack(alignment: .leading) {
            NavigationStack(path: $path) {
                VStack(spacing: 0) {
                    StickyGlassHeader(title: selectedTab.title,
                                      onMenu: openSidebar) {
                        Button {
                            di.hapticsService.tap()
                        } label: {
                            Image(systemName: "sparkles")
                                .padding(10)
                                .background(DS.sunset, in: Circle())
                                .foregroundStyle(.white)
                        }
                        .accessibilityLabel("Highlights")
                    }

                    tabContent
                        .frame(maxWidth: .infinity, maxHeight: .infinity)

                    bottomBar
                }
                .background(Color(.systemBackground).ignoresSafeArea())
                .navigationDestination(for: AppRoute.self) { route in
                    switch route {
                    case .calculator(let kind): CalculatorDetailView(kind: kind)
                    case .historyDetail(let id): HistoryDetailView(id: id)
                    }
                }
            }

            // Blur backdrop when sidebar OR search is active.
            if appState.isSidebarOpen || sidebar.hasQuery {
                Rectangle()
                    .fill(.ultraThinMaterial)
                    .ignoresSafeArea()
                    .transition(.opacity)
                    .onTapGesture {
                        withAnimation(.snappy) {
                            appState.isSidebarOpen = false
                            sidebar.query = ""
                        }
                    }
                    .accessibilityHidden(true)
            }

            if appState.isSidebarOpen {
                SidebarView(vm: sidebar) { route in
                    handle(route)
                }
                .transition(.move(edge: .leading))
                .shadow(color: .black.opacity(0.15), radius: 20, x: 6)
            }
        }
        .animation(.snappy, value: appState.isSidebarOpen)
        .animation(.snappy, value: sidebar.hasQuery)
    }

    @ViewBuilder
    private var tabContent: some View {
        switch selectedTab {
        case .home: HomeView { path.append(AppRoute.calculator($0)) }
        case .calculators: CalculatorLibraryView { path.append(AppRoute.calculator($0)) }
        case .history: HistoryView()
        case .settings: SettingsView()
        }
    }

    private var bottomBar: some View {
        HStack {
            ForEach(AppTab.allCases) { tab in
                Button {
                    di.hapticsService.tap()
                    withAnimation(.snappy) { selectedTab = tab; path = NavigationPath() }
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: tab.systemImage)
                            .font(.system(size: 20, weight: selectedTab == tab ? .bold : .regular))
                        Text(tab.title).font(.caption2.weight(.semibold))
                    }
                    .foregroundStyle(selectedTab == tab ? AnyShapeStyle(DS.sunset) : AnyShapeStyle(Color.secondary))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }
                .accessibilityLabel(tab.title)
            }
        }
        .background(.ultraThinMaterial)
    }

    private func openSidebar() {
        di.hapticsService.tap()
        withAnimation(.snappy) { appState.isSidebarOpen.toggle() }
    }

    private func handle(_ route: SidebarRoute) {
        di.hapticsService.tap()
        withAnimation(.snappy) {
            appState.isSidebarOpen = false
            sidebar.query = ""
            switch route {
            case .tab(let t): selectedTab = t; path = NavigationPath()
            case .calculator(let k):
                selectedTab = .calculators
                path.append(AppRoute.calculator(k))
            }
        }
    }
}
