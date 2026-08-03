const { spawn } = require("child_process");
const path = require("path");

const cwd = process.cwd();
const args = process.argv.slice(2);
const ngCliPath = path.join(
    cwd,
    "node_modules",
    "@angular",
    "cli",
    "bin",
    "ng.js",
);

let angulartarget = "serve";

for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--project=")) {
        args.splice(i, 1);
        i--;
    } else if (arg.startsWith("--platform=")) {
        angulartarget = "ionic-cordova-serve";
        args.splice(i, 1);
        i--;
    }
}

console.log("> gulp watch &");
const gulp = spawn(
    process.platform === "win32" ? "cmd.exe" : "/bin/sh",
    process.platform === "win32"
        ? ["/d", "/s", "/c", "npx gulp watch"]
        : ["-c", "npx gulp watch"],
    {
        cwd,
        stdio: "inherit",
        shell: false,
        env: process.env,
    },
);

gulp.on("exit", (code) => {
    if (code && code !== 0) {
        process.exit(code);
    }
});

console.log(
    `> NODE_OPTIONS=--max-old-space-size=4096 node ${ngCliPath} run app:${angulartarget} ${args.join(" ")}`,
);
const ng = spawn(
    process.execPath,
    [ngCliPath, "run", `app:${angulartarget}`, ...args],
    {
        cwd,
        stdio: "inherit",
        env: {
            ...process.env,
            NODE_OPTIONS: "--max-old-space-size=4096",
        },
    },
);

ng.on("exit", (code) => {
    process.exit(code ?? 0);
});

process.on("SIGINT", () => {
    gulp.kill("SIGINT");
    ng.kill("SIGINT");
    process.exit(0);
});

process.on("SIGTERM", () => {
    gulp.kill("SIGTERM");
    ng.kill("SIGTERM");
    process.exit(0);
});
