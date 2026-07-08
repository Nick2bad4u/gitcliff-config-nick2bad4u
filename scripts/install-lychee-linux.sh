#!/usr/bin/env bash
set -euo pipefail

lychee_version="${LYCHEE_VERSION:-lychee-v0.24.2}"
lychee_target="${LYCHEE_TARGET:-x86_64-unknown-linux-gnu}"
archive_name="lychee-${lychee_target}.tar.gz"
base_url="https://github.com/lycheeverse/lychee/releases/download/${lychee_version}"
install_dir="${LYCHEE_INSTALL_DIR:-${RUNNER_TEMP:-/tmp}/lychee}"

mkdir -p "${install_dir}"

archive_path="${install_dir}/${archive_name}"
checksum_path="${archive_path}.sha256"

curl --fail --location --show-error --silent --output "${archive_path}" "${base_url}/${archive_name}"
curl --fail --location --show-error --silent --output "${checksum_path}" "${base_url}/${archive_name}.sha256"

expected_checksum="$(cut -d ' ' -f 1 "${checksum_path}")"
actual_checksum="$(sha256sum "${archive_path}" | cut -d ' ' -f 1)"

if [ "${expected_checksum}" != "${actual_checksum}" ]; then
    echo "Lychee checksum mismatch for ${archive_name}." >&2
    echo "Expected: ${expected_checksum}" >&2
    echo "Actual:   ${actual_checksum}" >&2
    exit 1
fi

tar -xzf "${archive_path}" -C "${install_dir}"
chmod +x "${install_dir}/lychee"

if [ -n "${GITHUB_PATH:-}" ]; then
    echo "${install_dir}" >> "${GITHUB_PATH}"
fi

"${install_dir}/lychee" --version
