#!/usr/bin/env fish

set dir (ls .. | fzf)
set path "../"$dir"/data"
echo $path

if test -d $path
    echo "Directory exists, proceeding to make symlink"
    ln -s $path data
else
    echo "Directory does not exist"
    exit 1
end
