# Remove quote escapes and enclosing quotes from JSON object.
# (There must be some cooler JS way to do this.)
sed -e 's@\\"@"@g' -e 's@"{@{@g'  -e 's@}"@}@g'
