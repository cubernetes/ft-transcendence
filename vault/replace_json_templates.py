#!/usr/bin/env python3

import re
import sys
import json
import random
import string
import contextlib


character_sets = {
    'alnum': string.ascii_letters + string.digits,
    'alpha': string.ascii_letters,
    'digits': string.digits,
}

def usage(name: str) -> None:
    print(f"{name} [FILE]")

def parse_json(name: str, args: list[str]) -> dict:
    if len(args) > 1:
        usage(name)
        return {}

    # youtu.be/bOKt0DnttxI
    with contextlib.ExitStack() as ctx:
        if len(args) == 1:
            try:
                stream = ctx.enter_context(open(args[0]))
            except FileNotFoundError:
                print(f"Error opening file: \"{args[0]}\"")
                return {}
        else:
            stream = sys.stdin
        
        try:
            data = json.load(stream)
        except json.decoder.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return {}

    if not data:
        print(f"JSON object is empty")
    return data

def replace_templates(s: str) -> str:
    if (m := re.match(r'\{\{(\w+):(\d+)\}\}', s)):
        template_type = m[1]
        template_len = int(m[2])
        character_set = character_sets.get(template_type, '')
        if not character_set:
            print(f'\033\133;91mWARNING\033\133m: Unknown template type: \033\133;93m{template_type}\033\133m, supported types are \033\133;92m{", ".join(character_sets.keys())}\033\133m. Leaving it unmodified')
            return s
        return ''.join(random.choices(character_set, k=template_len))
    elif re.match(r'\{\{.*\}\}', s):
        print(f"\033\133;91mWARNING\033\133m: Found template string \033\133;93m{s}\033\133m, but it doesn't match the expected regex \033\133;94m\\{{\\{{(\\w+):(\\d+)\\}}\\}}\033\133m. Leaving it unmodified")
        return s
    else:
        return s

def transform_json(data: dict | list | str | int | float) -> dict:
    new_data = {}
    for key, value in data.items():
        new_key = replace_templates(key)
        if isinstance(value, str):
            new_value = replace_templates(value)
        else:
            new_value = transform_json(value)
        new_data[new_key] = new_value
    return new_data

def main(name: str, args: list[str]) -> int:
    data = parse_json(name, args)
    if not data:
        return 1

    new_data = transform_json(data)

    print(json.dumps(new_data, indent=4, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[0], sys.argv[1:]))
