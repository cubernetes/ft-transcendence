#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

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

int main(int argc, char **argv) {
  if (argc < 5) {
    printf("Usage: %s UID GID CMD ARG0 [ARGS...]", argv[0]);
    return EXIT_FAILURE;
  }

  int uid = atoi(argv[1]);
  int gid = atoi(argv[2]);

  char *cmd = argv[3];
  char **args = argv + 4;

  runAs(uid, gid, cmd, args);

  return EXIT_FAILURE;
}
