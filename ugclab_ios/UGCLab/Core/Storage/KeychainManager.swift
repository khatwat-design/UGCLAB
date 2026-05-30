import Foundation
import Security

class KeychainManager {
    static let shared = KeychainManager()
    private let service = "com.ugclab.app"

    func saveToken(_ token: String) {
        save(key: "auth_token", value: token)
    }

    func getToken() -> String? {
        read(key: "auth_token")
    }

    func saveRole(_ role: String) {
        save(key: "user_role", value: role)
    }

    func getRole() -> String? {
        read(key: "user_role")
    }

    func clear() {
        delete(key: "auth_token")
        delete(key: "user_role")
    }

    private func save(key: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    private func read(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }
}
