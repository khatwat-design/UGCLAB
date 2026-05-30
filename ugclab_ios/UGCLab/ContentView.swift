import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            if appState.isLoading {
                LoadingView()
            } else if !appState.isAuthenticated {
                OnboardingView()
            } else if appState.userRole == .creator {
                CreatorTabView()
            } else if appState.userRole == .advertiser {
                AdvertiserTabView()
            } else {
                OnboardingView()
            }
        }
    }
}

struct CreatorTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            CreatorHomeView()
                .tabItem { Label("الرئيسية", systemImage: selectedTab == 0 ? "house.fill" : "house") }
                .tag(0)

            NavigationStack { ReelsView() }
                .tabItem { Label("الريلز", systemImage: selectedTab == 1 ? "video.fill" : "video") }
                .tag(1)

            NavigationStack { ExploreView() }
                .tabItem { Label("استكشاف", systemImage: selectedTab == 2 ? "magnifyingglass.circle.fill" : "magnifyingglass.circle") }
                .tag(2)

            NavigationStack { ConversationsView() }
                .tabItem { Label("الرسائل", systemImage: selectedTab == 3 ? "message.fill" : "message") }
                .tag(3)
        }
        .tint(AppColors.primary)
    }
}

struct AdvertiserTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            AdvertiserHomeView()
                .tabItem { Label("الرئيسية", systemImage: selectedTab == 0 ? "house.fill" : "house") }
                .tag(0)

            NavigationStack { ReelsView() }
                .tabItem { Label("الريلز", systemImage: selectedTab == 1 ? "video.fill" : "video") }
                .tag(1)

            NavigationStack { ExploreView() }
                .tabItem { Label("استكشاف", systemImage: selectedTab == 2 ? "magnifyingglass.circle.fill" : "magnifyingglass.circle") }
                .tag(2)

            NavigationStack { ConversationsView() }
                .tabItem { Label("الرسائل", systemImage: selectedTab == 3 ? "message.fill" : "message") }
                .tag(3)
        }
        .tint(AppColors.primary)
    }
}
