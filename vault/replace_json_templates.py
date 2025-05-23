#!/usr/bin/env python3
# Author: https://github.com/cubernetes
# License: Public Domain
#
# This unix filter replaces simple mustache templates in json strings. Example:
# {
#   "foo": "{{digit:16}}"
# }
#
# could turn into
# {
#   "foo": "2819465738296500"
# }
#
# Supported template types are the alnum, alpha, and digit, which refer to the same C locale
# character classes as described in grep(1) or Section 3.2 from the GNU grep manual:
#   https://www.gnu.org/software/grep/manual/html_node/Character-Classes-and-Bracket-Expressions.html
#
# After the alphanumeric (+underscore) template type, there must always be a colon
# and then a series of digits. Otherwise, no replacement occurs and a warning is printed.

import os
import re
import sys
import json
import shlex
import secrets
import string
import contextlib
from base64 import b64encode

# Maximum 5 levels of indirection
PASSES = 5

character_sets = {
    'alnum': string.ascii_letters + string.digits,
    'alpha': string.ascii_letters,
    'digit': string.digits,
}

def usage(name: str) -> None:
    print(f"{name} [FILE]", file=sys.stderr, flush=True)

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
                print(f"Error opening file: \"{args[0]}\"", file=sys.stderr, flush=True)
                return {}
        else:
            stream = sys.stdin
        
        try:
            data = json.load(stream)
        except json.decoder.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}", file=sys.stderr, flush=True)
            return {}

    return data

def resolve_json_path(json_object: dict | list | str | int | float | bool | None, json_path: list) -> dict | list | str | int | float | bool | None:
    for key in json_path:
        try:
            if isinstance(json_object, dict) and isinstance(key, str):
                json_object = json_object[key]
            elif isinstance(json_object, list) and isinstance(key, int):
                json_object = json_object[key]
            elif isinstance(json_object, dict) or isinstance(json_object, list):
                print(f'\033\133;91mWARNING\033\133m: Ref JSON Path: Trying to use a string index on a list or an int key on an object. Leaving template unmodified', file=sys.stderr, flush=True)
                return "___error___"
            else:
                print(f'\033\133;91mWARNING\033\133m: Ref JSON Path: Trying to use a string index or an int key on something that is neither object nor list. Leaving template unmodified', file=sys.stderr, flush=True)
                return "___error___"
        except KeyError:
            print(f'\033\133;91mWARNING\033\133m: Ref JSON Path: KeyError. Leaving template unmodified', file=sys.stderr, flush=True)
            return "___error___"
        except IndexError:
            print(f'\033\133;91mWARNING\033\133m: Ref JSON Path: IndexError. Leaving template unmodified', file=sys.stderr, flush=True)
            return "___error___"
    return json_object

def replacement_function(match: re.Match, *, references: bool) -> str:
    global json_object
    raw_match_string = match[0]
    template_type = match[1]
    template_argument = match[2]
    if template_type in ['alnum', 'alpha', 'digit']:
        character_set = character_sets.get(template_type, '')
        if not character_set:
            print(f'\033\133;91mWARNING\033\133m: Unknown template type: \033\133;93m{template_type}\033\133m, supported types are \033\133;92m{", ".join(character_sets.keys())}\033\133m. Leaving it unmodified', file=sys.stderr, flush=True)
            return raw_match_string
        return ''.join(secrets.choice(character_set) for _ in range(int(template_argument)))
    elif template_type == 'b64':
        n_bytes = int(template_argument)
        return b64encode(secrets.token_bytes(n_bytes)).decode('utf8')
    elif template_type == 'env':
        return os.environ.get(template_argument, '')
    elif template_type == 'ref':
        if not references:
            return raw_match_string
        lexer = shlex.shlex(template_argument)
        lexer.whitespace = ','
        lexer.whitespace_split = True
        lexer.quotes = "'"
        try:
            tokens = list(iter(lexer.get_token, ''))
            json_path = []
            for token in tokens:
                if not token:
                    print(f'\033\133;91mWARNING\033\133m: Ref JSON path contains empty string. Leaving template unmodified', file=sys.stderr, flush=True)
                    return raw_match_string
                elif token[0] == "'" == token[-1]:
                    json_path.append(token[1:-1])
                elif token.isdecimal():
                    json_path.append(int(token))
                else:
                    print(f'\033\133;91mWARNING\033\133m: Ref JSON path contains invalid token: \033\133;93m{token}\033\133m. Leaving template unmodified', file=sys.stderr, flush=True)
                    return raw_match_string
            json_item = resolve_json_path(json_object, json_path)
            if json_item == "___error___":
                return raw_match_string
            if not isinstance(json_item, str) or json_item is None:
                    print(f'\033\133;91mWARNING\033\133m: Ref JSON path did not return a string. Leaving template unmodified', file=sys.stderr, flush=True)
                    return raw_match_string
            return json_item
        except ValueError:
            print(f'\033\133;91mWARNING\033\133m: Ref JSON path is wrongly quoted. Leaving template unmodified', file=sys.stderr, flush=True)
            return raw_match_string
    else:
        return raw_match_string

def replace_templates(s: str, *, references: bool) -> str:
    replaced = re.sub(r'\{\{(\w+):([^}]+)\}\}', lambda m: replacement_function(m, references=references), s)

    return replaced

def transform_json(data: dict | list | str | int | float | bool | None, *, references: bool) -> dict | list | str | int | float | bool | None:
    if isinstance(data, dict):
        new_data = {}
        for key, value in data.items():
            new_key = replace_templates(key, references=references)
            new_value = transform_json(value, references=references)
            new_data[new_key] = new_value
        return new_data
    elif isinstance(data, list):
        new_data = []
        for value in data:
            new_data.append(transform_json(value, references=references))
        return new_data
    elif isinstance(data, str):
        return replace_templates(data, references=references)
    else:
        return data

def main(name: str, args: list[str]) -> int:
    global json_object
    json_object = parse_json(name, args)

    for _ in range(PASSES):
        json_object = transform_json(json_object, references=False)
        json_object = transform_json(json_object, references=True)

    print(json.dumps(json_object, indent=4, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[0], sys.argv[1:]))
