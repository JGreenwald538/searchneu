# outputs.tf

output "github_actions_AWS_ACCESS_KEY_ID" {
  value = aws_iam_access_key.github_actions_user.id
}
output "github_actions_AWS_SECRET_ACCESS_KEY" {
  value = aws_iam_access_key.github_actions_user.secret
}