@echo off
echo 正在启用真实邮件发送...
set SKIP_MAIL_SENDING=false
echo SKIP_MAIL_SENDING=%SKIP_MAIL_SENDING%
echo 真实邮件发送已启用！
echo.
echo 现在可以测试真实邮箱验证码了
echo 用法: node test-real-email.js your-email@example.com
pause 