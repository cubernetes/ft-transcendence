#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

/* sudo, su, or doas all keep themselves between the parent process and the
 * child process, making it impossible to wrap init systems such as /bin/tini.
 * This little program doesn't do that, it properly, plainly calls execve
 * without forking before.
 */

extern char **environ;

int runAs(int uid, int gid, char *cmd, char *args[]) {
  if (setgid(gid) < 0) {
    perror("setgid");
    return -1;
  }
  if (setuid(uid) < 0) {
    perror("setuid");
    return -1;
  }
  execve(cmd, args, environ);
  perror("execve");
  return -1;
}

void usage(char *argv0) {
  printf("Usage: %s [-e NAME=VALUE] UID GID CMD ARG0 "
         "[ARGS...]\n\nOptions:\n\t-e NAME=VALUE\tset/change environment "
         "variable; may be specified multiple times\n",
         argv0);
  exit(EXIT_FAILURE);
}

int main(int argc, char **argv) {
  if (argc < 5)
    usage(argv[0]);

  int i = 1;

  while (!strcmp(argv[i], "-e")) {
    if (argv[i + 1] == NULL)
      usage(argv[0]);
    char *name_end = strchr(argv[i + 1], '=');
    if (name_end == NULL)
      usage(argv[0]);
    *name_end = 0;
    char *value = name_end + 1;
    if (setenv(argv[i + 1], value, 1) < 0) {
      perror("setenv");
      return EXIT_FAILURE;
    }
    i += 2;
  }

  int uid = atoi(argv[i]);
  int gid = atoi(argv[i + 1]);

  char *cmd = argv[i + 2];
  char **args = argv + i + 3;

  runAs(uid, gid, cmd, args);

  return EXIT_FAILURE;
}
