import SwiftUI

struct CampaignCard: View {
    let campaign: Campaign

    var body: some View {
        VStack(alignment: .trailing, spacing: 12) {
            HStack {
                StatusBadge(status: campaign.status)
                Spacer()
                Text(campaign.title)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
            }

            Text(campaign.description)
                .font(.system(size: 13))
                .foregroundColor(AppColors.textSecondary)
                .lineLimit(2)

            HStack {
                Text(Formatters.compactCurrency(campaign.budget))
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(AppColors.primary)
                Spacer()
                if campaign.applicationsCount > 0 {
                    Label("\(campaign.applicationsCount)", systemImage: "person.2.fill")
                        .font(.system(size: 12))
                        .foregroundColor(AppColors.textSecondary)
                }
            }
        }
        .padding(AppTheme.mediumPadding)
        .background(AppColors.surface)
        .cornerRadius(AppTheme.cardCornerRadius)
        .shadow(color: .black.opacity(0.04), radius: 4, y: 2)
    }
}
