import SwiftUI

@main
struct UGCLabApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environment(\.layoutDirection, .rightToLeft)
                .environment(\.locale, Locale(identifier: "ar"))
        }
    }
}

class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var userRole: UserRole?
    @Published var isLoading = true

    init() {
        checkAuth()
    }

    func checkAuth() {
        if let token = KeychainManager.shared.getToken() {
            APIClient.shared.setToken(token)
            isAuthenticated = true
            userRole = UserRole(rawValue: KeychainManager.shared.getRole() ?? "")
        }
        isLoading = false
    }

    func login(token: String, role: UserRole) {
        KeychainManager.shared.saveToken(token)
        KeychainManager.shared.saveRole(role.rawValue)
        APIClient.shared.setToken(token)
        isAuthenticated = true
        userRole = role
    }

    func logout() {
        KeychainManager.shared.clear()
        APIClient.shared.removeToken()
        isAuthenticated = false
        userRole = nil
    }
}
